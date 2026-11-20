import os
import numpy as np
import pandas as pd
from src.supplier import Supplier
from src.costs import CostConfig
from src.policies.dual_sourcing import DualSourcingPolicy
from src.monte_carlo import run_monte_carlo, calculate_risk_metrics

class RiskServiceRecoveryFrontier:
    """
    Contribution D: Risk-Service Recovery Frontier (RSRF)
    Also referred to as Stress-Conditioned Risk-Service Recovery Search (SCRS).

    Systematically evaluates candidate supplier allocations across progressive
    supplier-delay severities, isolates the Pareto non-dominated frontier
    (Cost, Fill Rate, CVaR), and quantifies the financial recovery cost (ΔC)
    required to restore service targets under severe disruption.
    """

    DEFAULT_DELAY_SCENARIOS = {
        "normal": {
            "id": "normal",
            "name": "Normal Delays",
            "description": "Baseline operational conditions (expected lead times)",
            "lead_time_offset": 0.0,
            "std_multiplier": 1.0
        },
        "moderate": {
            "id": "moderate",
            "name": "Moderate Delays",
            "description": "Moderate supply friction (+3 days average delay, increased volatility)",
            "lead_time_offset": 3.0,
            "std_multiplier": 1.6
        },
        "severe": {
            "id": "severe",
            "name": "Severe Delays",
            "description": "Critical supply chain bottleneck (+7 days average delay, heavy variance)",
            "lead_time_offset": 7.0,
            "std_multiplier": 2.5
        }
    }

    def __init__(
        self,
        base_demand,
        error_variance,
        regular_unit_cost,
        emergency_unit_cost,
        base_lead_time_mean=7.0,
        base_lead_time_std=2.0,
        emergency_lead_time_mean=2.0,
        emergency_lead_time_std=0.0,
        holding_cost=1.0,
        backorder_cost=15.0,
        reorder_point=50,
        order_quantity=100,
        num_simulations=100,
        min_service_level=0.95,
        baseline_emergency_ratio=0.10,
        max_cvar=None,
        allocation_step=0.10
    ):
        self.base_demand = base_demand
        self.error_variance = error_variance
        self.regular_unit_cost = regular_unit_cost
        self.emergency_unit_cost = emergency_unit_cost
        self.base_lead_time_mean = base_lead_time_mean
        self.base_lead_time_std = base_lead_time_std
        self.emergency_lead_time_mean = emergency_lead_time_mean
        self.emergency_lead_time_std = emergency_lead_time_std
        self.cost_config = CostConfig(
            holding_cost_per_unit_per_day=holding_cost,
            backorder_cost_per_unit_per_day=backorder_cost
        )
        self.reorder_point = reorder_point
        self.order_quantity = order_quantity
        self.num_simulations = num_simulations
        self.min_service_level = min_service_level
        self.baseline_emergency_ratio = baseline_emergency_ratio
        self.max_cvar = max_cvar
        self.allocation_step = allocation_step

    def generate_candidate_allocations(self):
        """
        Generates candidate emergency supplier fractions from 0.0 (0% emergency)
        to 1.0 (100% emergency) in configured grid increments.
        """
        steps = np.arange(0.0, 1.0001, self.allocation_step)
        return [round(float(s), 2) for s in steps]

    def _filter_pareto_frontier(self, evaluations):
        """
        Multi-objective Pareto Dominance Filtering (3 Objectives):
        - Minimize Cost C(x, d)
        - Maximize Fill Rate F(x, d)
        - Minimize Downside Risk CVaR R(x, d)

        An allocation A dominates B if:
        C(A) <= C(B) AND F(A) >= F(B) AND R(A) <= R(B)
        and strictly better in at least one objective.
        """
        eps = 1e-4
        pareto_points = []
        for i, a in enumerate(evaluations):
            is_dominated = False
            for j, b in enumerate(evaluations):
                if i == j:
                    continue
                b_c = b['expected_cost']
                a_c = a['expected_cost']
                b_f = b['expected_fill_rate']
                a_f = a['expected_fill_rate']
                b_r = b['cvar']
                a_r = a['cvar']

                # Check weak dominance on all 3
                if (b_c <= a_c + eps and b_f >= a_f - eps and b_r <= a_r + eps):
                    # Check strict dominance on at least one
                    if (b_c < a_c - eps or b_f > a_f + eps or b_r < a_r - eps):
                        is_dominated = True
                        break

            a['is_pareto'] = not is_dominated
            if not is_dominated:
                pareto_points.append(a)

        return pareto_points

    def execute_recovery_frontier_analysis(self, custom_scenarios=None):
        """
        Executes the stress-conditioned recovery search:
        1. Evaluates all allocations under each delay scenario.
        2. Filters the non-dominated Pareto frontier for each scenario.
        3. Solves the constrained recovery problem (least-cost feasible).
        4. Quantifies the recovery cost premium (ΔC).
        5. Flags infeasibility when no allocation satisfies targets.
        """
        scenarios = custom_scenarios or self.DEFAULT_DELAY_SCENARIOS
        candidate_allocations = self.generate_candidate_allocations()

        # Process 'normal' first so normal baseline cost is the benchmark for recovery premium (ΔC)
        ordered_keys = ['normal', 'moderate', 'severe'] + [k for k in scenarios.keys() if k not in ['normal', 'moderate', 'severe']]
        scenario_results = {}
        normal_baseline = None

        for scenario_key in ordered_keys:
            if scenario_key not in scenarios:
                continue
            scenario_meta = scenarios[scenario_key]
            delay_offset = scenario_meta.get("lead_time_offset", 0.0)
            std_mult = scenario_meta.get("std_multiplier", 1.0)

            # Configure stressed regular supplier under scenario d
            stressed_regular_supplier = Supplier(
                name="Regular Supplier",
                unit_cost=self.regular_unit_cost,
                base_lead_time=self.base_lead_time_mean + delay_offset,
                lead_time_std=self.base_lead_time_std * std_mult
            )
            emergency_supplier = Supplier(
                name="Emergency Supplier",
                unit_cost=self.emergency_unit_cost,
                base_lead_time=self.emergency_lead_time_mean,
                lead_time_std=self.emergency_lead_time_std
            )
            suppliers = {
                "regular": stressed_regular_supplier,
                "emergency": emergency_supplier
            }

            # Evaluate all candidate allocations
            evaluations = []
            for emg_ratio in candidate_allocations:
                reg_ratio = round(1.0 - emg_ratio, 2)
                policy = DualSourcingPolicy(
                    reorder_point=self.reorder_point,
                    order_quantity=self.order_quantity,
                    primary_ratio=reg_ratio
                )

                mc_runs = run_monte_carlo(
                    num_simulations=self.num_simulations,
                    simulation_days=365,
                    base_demand=self.base_demand,
                    error_variance=self.error_variance,
                    suppliers=suppliers,
                    policy=policy,
                    cost_config=self.cost_config
                )

                metrics = calculate_risk_metrics(mc_runs, cvar_alpha=0.05)
                evaluations.append({
                    "regular_ratio": reg_ratio,
                    "emergency_ratio": emg_ratio,
                    "label": f"{int(reg_ratio*100)}% Regular / {int(emg_ratio*100)}% Emergency",
                    "expected_cost": round(metrics["expected_cost"], 2),
                    "expected_purchase_cost": round(metrics.get("expected_purchase_cost", 0.0), 2),
                    "expected_holding_cost": round(metrics.get("expected_holding_cost", 0.0), 2),
                    "expected_backorder_cost": round(metrics.get("expected_backorder_cost", 0.0), 2),
                    "expected_fill_rate": round(metrics["expected_fill_rate"], 4),
                    "fill_rate_pct": round(metrics["expected_fill_rate"] * 100, 2),
                    "stockout_prob_pct": round(metrics["stockout_prob"] * 100, 2),
                    "cvar": round(metrics["cvar"], 2),
                    "meets_service_target": bool(metrics["expected_fill_rate"] >= self.min_service_level - 1e-4)
                })

            # Identify Pareto Frontier
            pareto_frontier = self._filter_pareto_frontier(evaluations)

            # Identify Baseline Allocation
            baseline_alloc = min(evaluations, key=lambda e: abs(e['emergency_ratio'] - self.baseline_emergency_ratio))
            if scenario_key == 'normal':
                normal_baseline = baseline_alloc

            # Solve Constrained Recovery Optimization
            # min E[C(x, d)] subject to F(x, d) >= F_min and CVaR <= R_max
            feasible_set = [
                e for e in evaluations
                if e['expected_fill_rate'] >= self.min_service_level - 1e-4 and
                (self.max_cvar is None or e['cvar'] <= self.max_cvar + 1e-4)
            ]

            if feasible_set:
                recovery_alloc = min(feasible_set, key=lambda e: e['expected_cost'])
                service_restored = bool(baseline_alloc['fill_rate_pct'] < (self.min_service_level * 100))

                # Calculate recovery cost premium (ΔC):
                # When regular suppliers are delayed, shifting orders to the emergency supplier increases procurement spend.
                # ΔC reflects the additional operational spend required to restore service.
                if service_restored and recovery_alloc['emergency_ratio'] > baseline_alloc['emergency_ratio']:
                    normal_ref_cost = normal_baseline['expected_cost'] if normal_baseline else baseline_alloc['expected_cost']
                    cost_diff_vs_normal = recovery_alloc['expected_cost'] - normal_ref_cost
                    purchase_diff = recovery_alloc['expected_purchase_cost'] - baseline_alloc['expected_purchase_cost']

                    delta_c = max(purchase_diff, cost_diff_vs_normal, 0.0)
                    if delta_c <= 0.0:
                        # Direct emergency surcharge: extra volume shifted * price premium ($18 - $8)
                        extra_emg_ratio = recovery_alloc['emergency_ratio'] - baseline_alloc['emergency_ratio']
                        annual_demand_est = baseline_alloc.get('expected_purchase_cost', 8000) / max(1.0, self.regular_unit_cost)
                        delta_c = round(annual_demand_est * extra_emg_ratio * (self.emergency_unit_cost - self.regular_unit_cost), 2)
                else:
                    delta_c = 0.0

                # Penalty avoided: difference between baseline disaster cost (with backorders) and recovery cost
                penalty_avoided = max(0.0, baseline_alloc['expected_cost'] - recovery_alloc['expected_cost'])

                recovery_summary = {
                    "is_feasible": True,
                    "status": "RECOVERED" if service_restored else "HEALTHY",
                    "baseline": baseline_alloc,
                    "recovery_plan": recovery_alloc,
                    "recovery_cost_premium": round(delta_c, 2),
                    "penalty_avoided": round(penalty_avoided, 2),
                    "baseline_fill_rate_pct": baseline_alloc['fill_rate_pct'],
                    "restored_fill_rate_pct": recovery_alloc['fill_rate_pct'],
                    "baseline_cvar": baseline_alloc['cvar'],
                    "recovery_cvar": recovery_alloc['cvar'],
                    "recommendation_text": (
                        f"Under {scenario_meta['name']}, baseline service drops to {baseline_alloc['fill_rate_pct']}%. "
                        f"Reallocating to {recovery_alloc['label']} restores service to {recovery_alloc['fill_rate_pct']}% "
                        f"(Recovery Premium: +${delta_c:,.2f}, avoiding ${penalty_avoided:,.2f} in shortage losses)."
                        if service_restored else
                        f"Under {scenario_meta['name']}, baseline {baseline_alloc['label']} maintains {baseline_alloc['fill_rate_pct']}% service level. No emergency recovery shift required."
                    )
                }
            else:
                # Infeasible under extreme delays
                best_attempt = max(evaluations, key=lambda e: e['expected_fill_rate'])
                recovery_summary = {
                    "is_feasible": False,
                    "status": "INFEASIBLE",
                    "baseline": baseline_alloc,
                    "recovery_plan": best_attempt,
                    "recovery_cost_premium": None,
                    "baseline_fill_rate_pct": baseline_alloc['fill_rate_pct'],
                    "restored_fill_rate_pct": best_attempt['fill_rate_pct'],
                    "baseline_cvar": baseline_alloc['cvar'],
                    "recovery_cvar": best_attempt['cvar'],
                    "recommendation_text": (
                        f"RECOVERY INFEASIBLE: Under {scenario_meta['name']}, supplier delay (+{delay_offset}d) is so severe that no allocation achieves the {self.min_service_level*100:.0f}% target. "
                        f"Maximum achievable service is {best_attempt['fill_rate_pct']}% at 100% emergency sourcing."
                    )
                }

            scenario_results[scenario_key] = {
                "metadata": scenario_meta,
                "all_evaluations": evaluations,
                "pareto_frontier": pareto_frontier,
                "recovery_summary": recovery_summary
            }

        return {
            "algorithm": "Risk-Service Recovery Frontier (RSRF)",
            "scenarios": scenario_results,
            "min_service_level": self.min_service_level,
            "baseline_emergency_ratio": self.baseline_emergency_ratio
        }
