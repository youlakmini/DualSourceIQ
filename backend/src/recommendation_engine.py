import os
import pickle
import numpy as np
import pandas as pd
from src.data_loader import load_m5_product_demand
from src.supplier import Supplier
from src.costs import CostConfig
from src.policies.dual_sourcing import DualSourcingPolicy
from src.monte_carlo import run_monte_carlo, calculate_risk_metrics

class RecommendationEngine:
    def __init__(
        self,
        base_demand,
        error_variance,
        suppliers,
        cost_config,
        num_simulations=100,
        risk_aversion=0.5, # 0 = only care about average cost, 1 = heavily penalize CVaR risk
        min_service_level=0.95
    ):
        self.base_demand = base_demand
        self.error_variance = error_variance
        self.suppliers = suppliers
        self.cost_config = cost_config
        self.num_simulations = num_simulations
        self.risk_aversion = risk_aversion
        self.min_service_level = min_service_level

    def generate_candidate_plans(self):
        """Generates ratios from 1.0 (100% regular) down to 0.0 (0% regular) in 0.1 increments."""
        ratios = np.arange(1.0, -0.1, -0.1)
        return [round(r, 1) for r in ratios]

    def evaluate_plan(self, primary_ratio):
        policy = DualSourcingPolicy(
            reorder_point=50,
            order_quantity=100,
            primary_ratio=primary_ratio
        )
        
        results = run_monte_carlo(
            num_simulations=self.num_simulations,
            simulation_days=365,
            base_demand=self.base_demand,
            error_variance=self.error_variance,
            suppliers=self.suppliers,
            policy=policy,
            cost_config=self.cost_config
        )
        
        metrics = calculate_risk_metrics(results, cvar_alpha=0.05)
        
        # Calculate Risk-Adjusted Score
        # Formula: (1 - risk_aversion) * Expected Cost + (risk_aversion) * CVaR
        # Lower score is better
        risk_adjusted_score = (
            (1 - self.risk_aversion) * metrics['expected_cost'] +
            (self.risk_aversion) * metrics['cvar']
        )
        
        metrics['primary_ratio'] = primary_ratio
        metrics['risk_adjusted_score'] = risk_adjusted_score
        
        # Check Feasibility
        metrics['is_feasible'] = bool(metrics['expected_fill_rate'] >= self.min_service_level)
        
        return metrics

    def run(self):
        print("\nStarting Risk-Aware Recommendation Algorithm...")
        plans = self.generate_candidate_plans()
        
        evaluated_plans = []
        for ratio in plans:
            print(f"\nEvaluating Plan: {int(ratio*100)}% Regular / {int((1-ratio)*100)}% Emergency")
            metrics = self.evaluate_plan(ratio)
            evaluated_plans.append(metrics)
            
        # Filter infeasible plans
        feasible_plans = [p for p in evaluated_plans if p['is_feasible']]
        
        if not feasible_plans:
            print("ERROR: No feasible plans found that meet the minimum service level!")
            return None
            
        # Rank by risk-adjusted score (lowest is best)
        ranked_plans = sorted(feasible_plans, key=lambda x: x['risk_adjusted_score'])
        best_plan = ranked_plans[0]
        
        self._print_recommendation(best_plan, ranked_plans)
        return best_plan

    def _print_recommendation(self, best_plan, all_ranked):
        primary_pct = int(best_plan['primary_ratio'] * 100)
        emergency_pct = int((1 - best_plan['primary_ratio']) * 100)
        
        print("\n" + "="*50)
        print("OPTIMAL SOURCING RECOMMENDATION")
        print("="*50)
        print(f"Recommended Split: {primary_pct}% Regular Supplier, {emergency_pct}% Emergency Supplier")
        print(f"Expected Cost    : ${best_plan['expected_cost']:,.2f}")
        print(f"Risk (CVaR)      : ${best_plan['cvar']:,.2f}")
        print(f"Service Level    : {best_plan['expected_fill_rate']*100:.2f}%")
        print(f"Risk-Adjusted Score: {best_plan['risk_adjusted_score']:,.2f}")
        print("-" * 50)
        
        # Explanation Generation
        if primary_pct == 100:
            explanation = "Recommendation: Use exclusively the Regular Supplier. The cost savings outweigh the potential risk of lead-time delays, and service levels remain above the required threshold."
        elif emergency_pct == 100:
            explanation = "Recommendation: Use exclusively the Emergency Supplier. The risk of delays from the Regular Supplier is too high to maintain service levels, justifying the premium cost."
        else:
            explanation = f"Recommendation: Diversify sourcing. Allocating {emergency_pct}% to the Emergency Supplier acts as an insurance policy. It slightly increases expected costs but significantly reduces the CVaR (worst-case scenario risk) caused by the Regular Supplier's lead-time uncertainty, while keeping fill rates safely above the minimum threshold."
            
        print("EXPLANATION:")
        print(explanation)
        print("="*50)


if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Load base demand 
    data_path = os.path.join(base_dir, 'data', 'raw', 'sales_train_evaluation.csv')
    base_demand, _ = load_m5_product_demand(data_path, row_index=0, number_of_days=365)
    
    # Load error variance
    model_file = os.path.join(base_dir, 'experiments', 'xgboost_forecast.pkl')
    try:
        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            with open(model_file, 'rb') as f:
                model_data = pickle.load(f)
                error_var = model_data['error_variance']
    except FileNotFoundError:
        error_var = 10.0
        
    suppliers = {
        "regular": Supplier(name="Regular", unit_cost=8.0, base_lead_time=7, lead_time_std=2.0),
        "emergency": Supplier(name="Emergency", unit_cost=18.0, base_lead_time=2, lead_time_std=0.0)
    }
    
    costs = CostConfig(holding_cost_per_unit_per_day=0.10, backorder_cost_per_unit_per_day=5.00)
    
    engine = RecommendationEngine(
        base_demand=base_demand,
        error_variance=error_var,
        suppliers=suppliers,
        cost_config=costs,
        num_simulations=100, # Reduced to 100 for faster searching across 11 ratios
        risk_aversion=0.5,
        min_service_level=0.95
    )
    
    engine.run()
