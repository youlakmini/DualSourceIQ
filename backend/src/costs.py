from dataclasses import dataclass


@dataclass
class CostConfig:
    holding_cost_per_unit_per_day: float
    backorder_cost_per_unit_per_day: float