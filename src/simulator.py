from src.inventory import InventoryState, PipelineOrder


class InventorySimulator:

    def __init__(
        self,
        initial_inventory,
        suppliers, # Dictionary of Supplier objects: {'regular': Supplier(...), 'emergency': Supplier(...)}
        policy,
        cost_config
    ):

        self.state = InventoryState(
            on_hand=initial_inventory
        )

        self.suppliers = suppliers
        self.policy = policy
        self.cost_config = cost_config

        # Statistics
        self.total_demand = 0
        self.total_immediately_fulfilled = 0

        self.total_purchase_cost = 0.0
        self.total_holding_cost = 0.0
        self.total_backorder_cost = 0.0

        self.total_units_ordered = 0
        self.number_of_orders = 0

        self.inventory_history = []
        self.backorder_history = []

    def receive_orders(self, day):
        """
        Receive orders whose arrival day is today.
        """

        arriving_orders = [
            order
            for order in self.state.pipeline_orders
            if order.arrival_day <= day
        ]

        remaining_orders = [
            order
            for order in self.state.pipeline_orders
            if order.arrival_day > day
        ]

        self.state.pipeline_orders = remaining_orders

        for order in arriving_orders:

            received_quantity = order.quantity

            # First use incoming stock to satisfy backorders
            if self.state.backorders > 0:

                quantity_for_backorders = min(
                    received_quantity,
                    self.state.backorders
                )

                self.state.backorders -= quantity_for_backorders
                received_quantity -= quantity_for_backorders

            # Remaining quantity becomes normal inventory
            self.state.on_hand += received_quantity

    def satisfy_demand(self, demand):
        """
        Fulfil today's customer demand.
        """

        self.total_demand += demand

        immediately_fulfilled = min(
            self.state.on_hand,
            demand
        )

        self.total_immediately_fulfilled += immediately_fulfilled

        self.state.on_hand -= immediately_fulfilled

        unmet_demand = demand - immediately_fulfilled

        if unmet_demand > 0:
            self.state.backorders += unmet_demand

    def place_order(self, day):
        """
        Ask the policy whether we should order.
        Policy should return a list of tuples: [(supplier_key, quantity), ...]
        """

        inventory_position = self.state.inventory_position()

        # Policy now returns decisions for all suppliers it wants to use
        orders_to_place = self.policy.decide(
            inventory_position
        )
        
        # Backward compatibility for old policies returning a single int
        if isinstance(orders_to_place, int) or isinstance(orders_to_place, float):
            if orders_to_place > 0:
                # Default to the first supplier if not specified
                first_supplier_key = list(self.suppliers.keys())[0]
                orders_to_place = [(first_supplier_key, orders_to_place)]
            else:
                orders_to_place = []

        for supplier_key, quantity in orders_to_place:
            if quantity <= 0:
                continue

            supplier = self.suppliers[supplier_key]
            arrival_day = day + supplier.get_lead_time()

            order = PipelineOrder(
                quantity=quantity,
                arrival_day=arrival_day,
                supplier_name=supplier.name,
                unit_cost=supplier.unit_cost
            )

            self.state.pipeline_orders.append(order)

            purchase_cost = (
                quantity
                * supplier.unit_cost
            )

            self.total_purchase_cost += purchase_cost
            self.total_units_ordered += quantity
            self.number_of_orders += 1

    def calculate_daily_costs(self):

        holding_cost = (
            self.state.on_hand
            * self.cost_config.holding_cost_per_unit_per_day
        )

        backorder_cost = (
            self.state.backorders
            * self.cost_config.backorder_cost_per_unit_per_day
        )

        self.total_holding_cost += holding_cost
        self.total_backorder_cost += backorder_cost

    def run(self, demand_series):

        for day, demand in enumerate(demand_series):

            # 1. Receive deliveries
            self.receive_orders(day)

            # 2. Customer demand occurs
            self.satisfy_demand(int(demand))

            # 3. Decide whether to order
            self.place_order(day)

            # 4. Calculate costs
            self.calculate_daily_costs()

            # 5. Save history
            self.inventory_history.append(
                self.state.on_hand
            )

            self.backorder_history.append(
                self.state.backorders
            )

        return self.results()

    def results(self):

        if self.total_demand > 0:
            fill_rate = (
                self.total_immediately_fulfilled
                / self.total_demand
            )
        else:
            fill_rate = 1.0

        average_inventory = (
            sum(self.inventory_history)
            / len(self.inventory_history)
            if self.inventory_history
            else 0
        )

        total_cost = (
            self.total_purchase_cost
            + self.total_holding_cost
            + self.total_backorder_cost
        )

        return {
            "total_demand": self.total_demand,

            "immediately_fulfilled":
                self.total_immediately_fulfilled,

            "fill_rate": fill_rate,

            "average_inventory":
                average_inventory,

            "ending_inventory":
                self.state.on_hand,

            "ending_backorders":
                self.state.backorders,

            "units_ordered":
                self.total_units_ordered,

            "number_of_orders":
                self.number_of_orders,

            "purchase_cost":
                self.total_purchase_cost,

            "holding_cost":
                self.total_holding_cost,

            "backorder_cost":
                self.total_backorder_cost,

            "total_cost":
                total_cost
        }