from dataclasses import dataclass, field


@dataclass
class PipelineOrder:
    quantity: int
    arrival_day: int
    supplier_name: str
    unit_cost: float


@dataclass
class InventoryState:
    on_hand: int
    backorders: int = 0
    pipeline_orders: list[PipelineOrder] = field(default_factory=list)

    def inventory_position(self) -> int:
        """
        Inventory position =
        on-hand stock
        + stock already ordered
        - existing backorders
        """
        pipeline_quantity = sum(
            order.quantity for order in self.pipeline_orders
        )

        return self.on_hand + pipeline_quantity - self.backorders