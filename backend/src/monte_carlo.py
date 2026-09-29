import os
import pickle
import numpy as np
import pandas as pd
from src.data_loader import load_m5_product_demand
from src.supplier import Supplier
from src.costs import CostConfig
from src.policies.dual_sourcing import DualSourcingPolicy
from src.simulator import InventorySimulator

def run_monte_carlo(
    num_simulations: int,
    simulation_days: int,
    base_demand: np.ndarray,
    error_variance: float,
    suppliers: dict,
    policy,
    cost_config
):
    std_dev = np.sqrt(error_variance)
    results_list = []
    
    # We will log the first 10 simulations of this plan to a text file
    # (Logging all 1100 simulations across 11 plans creates too huge of a file)
    log_content = []
    ratio = getattr(policy, 'primary_ratio', 'Unknown')
    log_content.append(f"=== PLAN: {int(ratio*100)}% Regular / {int((1-ratio)*100)}% Emergency ===")
    
    for i in range(num_simulations):
        noise = np.random.normal(0, std_dev, size=simulation_days)
        stochastic_demand = np.maximum(0, np.round(base_demand + noise))
        
        simulator = InventorySimulator(
            initial_inventory=100,
            suppliers=suppliers,
            policy=policy,
            cost_config=cost_config
        )
        
        result = simulator.run(stochastic_demand)
        results_list.append(result)
        
        # Only log first 5 simulations per plan to keep the file readable
        if i < 5:
            log_content.append(f"\nSimulation {i+1} (365 Days)")
            log_content.append(f"Total Yearly Demand = {result['total_demand']} units")
            
            # Lead time logging
            if 'regular' in result['max_lead_times'] and result['max_lead_times']['regular'] > 0:
                log_content.append(f"Max Delay for Regular Supplier = {result['max_lead_times']['regular']} days")
            if 'emergency' in result['max_lead_times'] and result['max_lead_times']['emergency'] > 0:
                log_content.append(f"Max Delay for Emergency Supplier = {result['max_lead_times']['emergency']} days")
                
            if result['fill_rate'] < 1.0:
                log_content.append(f"→ Stockout occurred (Fill Rate: {result['fill_rate']*100:.2f}%)")
            else:
                log_content.append(f"→ No stockouts occurred (100% Fill Rate)")
            log_content.append(f"→ Total Cost = ${result['total_cost']:,.2f}")

    # Append to the log file
    log_file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "simulation_logs.txt")
    
    # If this is the 100% regular plan (first run), overwrite the file to start fresh. Otherwise, append.
    mode = 'w' if ratio == 1.0 else 'a'
    with open(log_file_path, mode, encoding='utf-8') as f:
        f.write("\n".join(log_content) + "\n\n")
        
    return results_list

def calculate_risk_metrics(results_list, cvar_alpha=0.05):
    """
    Calculates expected values and Conditional Value at Risk (CVaR).
    cvar_alpha=0.05 means the average of the worst 5% of outcomes (highest costs).
    """
    df_results = pd.DataFrame(results_list)
    
    expected_cost = df_results['total_cost'].mean()
    expected_fill_rate = df_results['fill_rate'].mean()
    stockout_prob = (df_results['fill_rate'] < 1.0).mean()
    
    # CVaR Calculation for Total Cost
    # 1. Sort costs descending (worst costs at the top)
    sorted_costs = df_results['total_cost'].sort_values(ascending=False).values
    
    # 2. Find the index for the worst alpha %
    cutoff_idx = int(len(sorted_costs) * cvar_alpha)
    if cutoff_idx == 0:
        cutoff_idx = 1 # ensure at least 1 worst-case is considered
        
    worst_cases = sorted_costs[:cutoff_idx]
    cvar = worst_cases.mean()
    
    print("\n" + "="*45)
    print("MONTE CARLO SIMULATION RESULTS")
    print("="*45)
    print(f"Number of Scenarios : {len(results_list)}")
    print(f"Expected Cost       : ${expected_cost:,.2f}")
    print(f"Expected Fill Rate  : {expected_fill_rate*100:.2f}%")
    print(f"Stockout Probability: {stockout_prob*100:.2f}%")
    print("-" * 45)
    print(f"Cost CVaR (Worst 5%): ${cvar:,.2f}")
    print("="*45)
    
    return {
        "expected_cost": expected_cost,
        "expected_fill_rate": expected_fill_rate,
        "stockout_prob": stockout_prob,
        "cvar": cvar
    }

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Load base demand for testing (e.g., product row 0)
    data_path = os.path.join(base_dir, 'data', 'raw', 'sales_train_evaluation.csv')
    base_demand, _ = load_m5_product_demand(data_path, row_index=0, number_of_days=365)
    
    # Load the error variance from our Phase 2 XGBoost model
    model_file = os.path.join(base_dir, 'experiments', 'xgboost_forecast.pkl')
    try:
        with open(model_file, 'rb') as f:
            model_data = pickle.load(f)
            error_var = model_data['error_variance']
    except FileNotFoundError:
        print("Model file not found. Using a default error variance for testing.")
        error_var = 10.0
        
    # Configure the simulation
    regular_supplier = Supplier(
        name="Regular Supplier",
        unit_cost=8.0,
        base_lead_time=7,
        lead_time_std=2.0 
    )
    
    emergency_supplier = Supplier(
        name="Emergency Supplier",
        unit_cost=18.0, 
        base_lead_time=2, 
        lead_time_std=0.0 
    )
    
    suppliers = {
        "regular": regular_supplier,
        "emergency": emergency_supplier
    }
    
    costs = CostConfig(
        holding_cost_per_unit_per_day=0.10,
        backorder_cost_per_unit_per_day=5.00
    )
    
    policy = DualSourcingPolicy(
        reorder_point=50,
        order_quantity=100,
        primary_ratio=0.8
    )
    
    # Run 500 simulations to get a robust risk profile
    results = run_monte_carlo(
        num_simulations=500,
        simulation_days=365,
        base_demand=base_demand,
        error_variance=error_var,
        suppliers=suppliers,
        policy=policy,
        cost_config=costs
    )
    
    calculate_risk_metrics(results)
