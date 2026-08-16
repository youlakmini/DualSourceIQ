class RegularOnlyPolicy:

    def __init__(
        self,
        reorder_point: int,
        order_quantity: int
    ):
        self.reorder_point = reorder_point
        self.order_quantity = order_quantity

    def decide(self, inventory_position: int) -> int:

        if inventory_position <= self.reorder_point:
            return self.order_quantity

        return 0