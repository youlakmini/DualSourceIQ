from src.data_loader import load_m5_product_demand
from src.supplier import Supplier
from src.costs import CostConfig
from src.policies.regular_only import RegularOnlyPolicy
from src.policies.dual_sourcing import DualSourcingPolicy
from src.simulator import InventorySimulator


DATA_PATH = "data/raw/sales_train_evaluation.csv"


def main():

    # -----------------------------
    # 1. Load demand
    # -----------------------------

    demand, product_info = load_m5_product_demand(
        file_path=DATA_PATH,
        row_index=2,
        number_of_days=365
    )

    print()
    print("Selected Product")
    print("-------------------------")

    for key, value in product_info.items():
        print(f"{key}: {value}")

    print()

    # -----------------------------
    # 2. Suppliers
    # -----------------------------

    regular_supplier = Supplier(
        name="Regular Supplier",
        unit_cost=8.0,
        base_lead_time=7,
        lead_time_std=2.0 # High uncertainty
    )
    
    emergency_supplier = Supplier(
        name="Emergency Supplier",
        unit_cost=18.0, # More expensive
        base_lead_time=2, # Faster
        lead_time_std=0.0 # Deterministic/reliable
    )
    
    suppliers = {
        "regular": regular_supplier,
        "emergency": emergency_supplier
    }

    # -----------------------------
    # 3. Cost configuration
    # -----------------------------

    costs = CostConfig(
        holding_cost_per_unit_per_day=0.10,
        backorder_cost_per_unit_per_day=5.00
    )

    # -----------------------------
    # 4. Reorder policy
    # -----------------------------

    policy = DualSourcingPolicy(
        reorder_point=50,
        order_quantity=100,
        primary_ratio=0.8 # 80% regular, 20% emergency
    )

    # -----------------------------
    # 5. Simulator
    # -----------------------------

    simulator = InventorySimulator(
        initial_inventory=100,
        suppliers=suppliers,
        policy=policy,
        cost_config=costs
    )


    # -----------------------------
    # 6. Run simulation
    # -----------------------------

    results = simulator.run(demand)

    # -----------------------------
    # 7. Show results
    # -----------------------------

    print()
    print("=" * 45)
    print("INVENTORY SIMULATION RESULTS")
    print("=" * 45)

    print(f"Simulation Days       : {len(demand)}")

    print(
        f"Total Demand          : "
        f"{results['total_demand']}"
    )

    print(
        f"Immediately Fulfilled : "
        f"{results['immediately_fulfilled']}"
    )

    print(
        f"Fill Rate             : "
        f"{results['fill_rate'] * 100:.2f}%"
    )

    print(
        f"Average Inventory     : "
        f"{results['average_inventory']:.2f}"
    )

    print(
        f"Ending Inventory      : "
        f"{results['ending_inventory']}"
    )

    print(
        f"Ending Backorders     : "
        f"{results['ending_backorders']}"
    )

    print()
    print("ORDERS")
    print("-" * 45)

    print(
        f"Number of Orders      : "
        f"{results['number_of_orders']}"
    )

    print(
        f"Units Ordered         : "
        f"{results['units_ordered']}"
    )

    print()
    print("COSTS")
    print("-" * 45)

    print(
        f"Purchase Cost         : "
        f"${results['purchase_cost']:,.2f}"
    )

    print(
        f"Holding Cost          : "
        f"${results['holding_cost']:,.2f}"
    )

    print(
        f"Backorder Cost        : "
        f"${results['backorder_cost']:,.2f}"
    )

    print("-" * 45)

    print(
        f"TOTAL COST            : "
        f"${results['total_cost']:,.2f}"
    )

    print("=" * 45)


if __name__ == "__main__":
    main()