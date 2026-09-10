from dataclasses import dataclass
import numpy as np


@dataclass
class Supplier:
    name: str
    unit_cost: float
    base_lead_time: int
    lead_time_std: float = 0.0 # Standard deviation of delay
    
    def get_lead_time(self) -> int:
        """
        Samples a stochastic lead time.
        Uses a log-normal distribution or normal distribution bounded to integers.
        If lead_time_std is 0, it's deterministic.
        """
        if self.lead_time_std == 0:
            return self.base_lead_time
        
        # Sample from a normal distribution and round to nearest int, ensure it's at least 1
        sampled = np.random.normal(loc=self.base_lead_time, scale=self.lead_time_std)
        return max(1, int(round(sampled)))