from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import pickle
import numpy as np

from src.data_loader import load_m5_product_demand
from src.supplier import Supplier
from src.costs import CostConfig
from src.recommendation_engine import RecommendationEngine
from database import get_db_connection, init_db

# Initialize database on startup
init_db()

app = FastAPI(title="DualSourceIQ API")

# Allow CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SimulationRequest(BaseModel):
    sku: str
    regular_lead_time_mean: int = 7
    regular_lead_time_std: float = 2.0
    regular_unit_cost: float = 8.0
    emergency_lead_time_mean: int = 2
    emergency_lead_time_std: float = 0.0
    emergency_unit_cost: float = 18.0
    risk_aversion: float = 0.5
    min_service_level: float = 0.95

class InventoryItem(BaseModel):
    sku: str
    name: str
    category: str
    on_hand_stock: int
    reorder_point: int
    safety_stock: int
    order_quantity: int
    holding_cost: float
    backorder_cost: float

@app.get("/")
def read_root():
    return {"status": "API is running"}

@app.get("/api/inventory")
def get_inventory():
    conn = get_db_connection()
    items = conn.execute("SELECT * FROM inventory").fetchall()
    conn.close()
    return [dict(item) for item in items]

@app.post("/api/inventory")
def create_inventory(item: InventoryItem):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO inventory (sku, name, category, on_hand_stock, reorder_point, safety_stock, order_quantity, holding_cost, backorder_cost)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (item.sku, item.name, item.category, item.on_hand_stock, item.reorder_point, item.safety_stock, item.order_quantity, item.holding_cost, item.backorder_cost))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="SKU already exists")
    conn.close()
    return {"status": "success", "message": "Item created"}

@app.put("/api/inventory/{item_id}")
def update_inventory(item_id: int, item: InventoryItem):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE inventory 
        SET sku=?, name=?, category=?, on_hand_stock=?, reorder_point=?, safety_stock=?, order_quantity=?, holding_cost=?, backorder_cost=?
        WHERE id=?
    """, (item.sku, item.name, item.category, item.on_hand_stock, item.reorder_point, item.safety_stock, item.order_quantity, item.holding_cost, item.backorder_cost, item_id))
    conn.commit()
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Item not found")
        
    conn.close()
    return {"status": "success", "message": "Inventory updated"}

@app.delete("/api/inventory/{item_id}")
def delete_inventory(item_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM inventory WHERE id=?", (item_id,))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Item deleted"}

@app.post("/api/simulate")
def run_simulation(request: SimulationRequest):
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        
        # 1. Fetch parameters from SQLite database based on SKU
        conn = get_db_connection()
        item_row = conn.execute("SELECT holding_cost, backorder_cost, reorder_point, order_quantity FROM inventory WHERE sku=?", (request.sku,)).fetchone()
        conn.close()
        
        if not item_row:
            raise HTTPException(status_code=404, detail=f"Product with SKU {request.sku} not found in database.")
            
        holding_cost = item_row['holding_cost']
        backorder_cost = item_row['backorder_cost']
        reorder_point = item_row['reorder_point']
        order_quantity = item_row['order_quantity']
        
        # Load demand
        data_path = os.path.join(base_dir, 'data', 'raw', 'sales_train_evaluation.csv')
        base_demand, product_info = load_m5_product_demand(data_path, sku=request.sku, number_of_days=365)
        
        # Load error variance
        model_file = os.path.join(base_dir, 'experiments', 'xgboost_forecast.pkl')
        try:
            with open(model_file, 'rb') as f:
                model_data = pickle.load(f)
                error_var = model_data['error_variance']
        except FileNotFoundError:
            error_var = 10.0
            
        # Configure Suppliers
        suppliers = {
            "regular": Supplier(
                name="Regular", 
                unit_cost=request.regular_unit_cost, 
                base_lead_time=request.regular_lead_time_mean, 
                lead_time_std=request.regular_lead_time_std
            ),
            "emergency": Supplier(
                name="Emergency", 
                unit_cost=request.emergency_unit_cost, 
                base_lead_time=request.emergency_lead_time_mean, 
                lead_time_std=request.emergency_lead_time_std
            )
        }
        
        costs = CostConfig(
            holding_cost_per_unit_per_day=holding_cost, 
            backorder_cost_per_unit_per_day=backorder_cost
        )
        
        # Run Engine
        engine = RecommendationEngine(
            base_demand=base_demand,
            error_variance=error_var,
            suppliers=suppliers,
            cost_config=costs,
            reorder_point=reorder_point,
            order_quantity=order_quantity,
            num_simulations=100,
            risk_aversion=request.risk_aversion,
            min_service_level=request.min_service_level
        )
        
        plans = engine.generate_candidate_plans()
        evaluated_plans = []
        for ratio in plans:
            metrics = engine.evaluate_plan(ratio)
            evaluated_plans.append(metrics)
            
        feasible_plans = [p for p in evaluated_plans if p['is_feasible']]
        
        if not feasible_plans:
            raise HTTPException(status_code=400, detail="No feasible plans found that meet the minimum service level.")
            
        ranked_plans = sorted(feasible_plans, key=lambda x: x['risk_adjusted_score'])
        best_plan = ranked_plans[0]
        
        return {
            "product_info": product_info,
            "best_plan": best_plan,
            "all_plans": evaluated_plans
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
