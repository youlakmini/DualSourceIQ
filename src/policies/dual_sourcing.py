class DualSourcingPolicy:
    def __init__(
        self,
        reorder_point: int,
        order_quantity: int,
        primary_supplier_key: str = "regular",
        emergency_supplier_key: str = "emergency",
        primary_ratio: float = 0.8
    ):
        """
        Policy that splits an order between two suppliers based on a fixed ratio.
        """
        self.reorder_point = reorder_point
        self.order_quantity = order_quantity
        
        self.primary_supplier_key = primary_supplier_key
        self.emergency_supplier_key = emergency_supplier_key
        
        # Determine how much goes to the regular vs emergency supplier
        self.primary_ratio = primary_ratio
        
    def decide(self, inventory_position: int) -> list:
        if inventory_position > self.reorder_point:
            return []
            
        primary_qty = int(self.order_quantity * self.primary_ratio)
        emergency_qty = self.order_quantity - primary_qty
        
        orders = []
        if primary_qty > 0:
            orders.append((self.primary_supplier_key, primary_qty))
        if emergency_qty > 0:
            orders.append((self.emergency_supplier_key, emergency_qty))
            
        return orders
