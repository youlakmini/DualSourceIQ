import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('simulation');
  
  // Simulation State
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({
    product_index: 0,
    regular_lead_time_mean: 7,
    regular_lead_time_std: 2.0,
    regular_unit_cost: 8.0,
    emergency_lead_time_mean: 2,
    emergency_lead_time_std: 0.0,
    emergency_unit_cost: 18.0,
    holding_cost: 0.10,
    backorder_cost: 5.00,
    risk_aversion: 0.5,
    min_service_level: 0.95
  });

  // Inventory State
  const [inventory, setInventory] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Fetch Inventory on load
  useEffect(() => {
    if (activeTab === 'inventory') {
      fetchInventory();
    }
  }, [activeTab]);

  const fetchInventory = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/inventory');
      const data = await response.json();
      setInventory(data);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
    }
  };

  const handleSimChange = (e) => {
    const { name, value } = e.target;
    setParams({ ...params, [name]: parseFloat(value) });
  };

  const runSimulation = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const response = await fetch('http://localhost:8000/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Simulation failed');
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Inventory Editing Functions
  const handleEditClick = (item) => {
    setEditingId(item.id);
    setEditFormData(item);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    // Keep SKU and Name as strings, convert others to numbers
    const parsedValue = (name === 'sku' || name === 'name') ? value : parseFloat(value);
    setEditFormData({ ...editFormData, [name]: parsedValue });
  };

  const handleSaveClick = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/inventory/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
      if (response.ok) {
        setEditingId(null);
        fetchInventory(); // Refresh data
      } else {
        alert("Failed to save item.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving item.");
    }
  };

  const handleCancelClick = () => {
    setEditingId(null);
  };

  return (
    <div className="App" style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Smart Dual-Supplier Inventory Decision Support System</h1>
      
      {/* Navigation Tabs */}
      <div style={{ marginBottom: '20px', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>
        <button 
          onClick={() => setActiveTab('simulation')}
          style={{ marginRight: '10px', padding: '10px', backgroundColor: activeTab === 'simulation' ? '#007BFF' : '#eee', color: activeTab === 'simulation' ? 'white' : 'black', border: 'none', cursor: 'pointer' }}>
          Simulation Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('inventory')}
          style={{ padding: '10px', backgroundColor: activeTab === 'inventory' ? '#007BFF' : '#eee', color: activeTab === 'inventory' ? 'white' : 'black', border: 'none', cursor: 'pointer' }}>
          Manage Inventory Data (UC02)
        </button>
      </div>

      {/* --- SIMULATION TAB --- */}
      {activeTab === 'simulation' && (
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: '1', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
            <h3>Simulation Parameters</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <label>Product Row Index: <input type="number" name="product_index" value={params.product_index} onChange={handleSimChange}/></label>
              <label>Risk Aversion (0-1): <input type="number" step="0.1" name="risk_aversion" value={params.risk_aversion} onChange={handleSimChange}/></label>
              <label>Holding Cost ($): <input type="number" step="0.01" name="holding_cost" value={params.holding_cost} onChange={handleSimChange}/></label>
              <label>Backorder Penalty ($): <input type="number" step="0.5" name="backorder_cost" value={params.backorder_cost} onChange={handleSimChange}/></label>
            </div>
            <h4 style={{ marginTop: '20px' }}>Regular Supplier</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
               <label>Cost ($): <input type="number" name="regular_unit_cost" value={params.regular_unit_cost} onChange={handleSimChange}/></label>
               <label>Lead Time: <input type="number" name="regular_lead_time_mean" value={params.regular_lead_time_mean} onChange={handleSimChange}/></label>
               <label>Std Dev: <input type="number" step="0.5" name="regular_lead_time_std" value={params.regular_lead_time_std} onChange={handleSimChange}/></label>
            </div>
            <h4 style={{ marginTop: '20px' }}>Emergency Supplier</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
               <label>Cost ($): <input type="number" name="emergency_unit_cost" value={params.emergency_unit_cost} onChange={handleSimChange}/></label>
               <label>Lead Time: <input type="number" name="emergency_lead_time_mean" value={params.emergency_lead_time_mean} onChange={handleSimChange}/></label>
               <label>Std Dev: <input type="number" step="0.5" name="emergency_lead_time_std" value={params.emergency_lead_time_std} onChange={handleSimChange}/></label>
            </div>
            <button onClick={runSimulation} disabled={loading} style={{ marginTop: '20px', padding: '10px', cursor: 'pointer' }}>
              {loading ? 'Running AI Engine...' : 'Run Risk-Aware Simulation'}
            </button>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
          </div>

          <div style={{ flex: '1', border: '1px solid #ccc', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <h3>Recommendation Results</h3>
            {!results && <p>Adjust parameters and click Run.</p>}
            {results && (
              <div>
                <div style={{ padding: '15px', backgroundColor: '#e7f3fe', borderLeft: '6px solid #2196F3' }}>
                  <h3>Optimal Split: {Math.round(results.best_plan.primary_ratio * 100)}% Regular / {Math.round((1 - results.best_plan.primary_ratio) * 100)}% Emergency</h3>
                  <p>Expected Cost: ${results.best_plan.expected_cost.toFixed(2)}</p>
                  <p>Risk (CVaR): ${results.best_plan.cvar.toFixed(2)}</p>
                  <p>Service Level: {(results.best_plan.expected_fill_rate * 100).toFixed(2)}%</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- INVENTORY MANAGEMENT TAB --- */}
      {activeTab === 'inventory' && (
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
          <h3>Master Inventory Data</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>SKU</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>On-Hand</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Reorder Pt</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Order Qty</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Hold Cost</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Backorder Cost</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id}>
                  {editingId === item.id ? (
                    <>
                      <td><input type="text" name="sku" value={editFormData.sku} onChange={handleEditChange} /></td>
                      <td><input type="text" name="name" value={editFormData.name} onChange={handleEditChange} /></td>
                      <td><input type="number" name="on_hand_stock" value={editFormData.on_hand_stock} onChange={handleEditChange} style={{width:'60px'}}/></td>
                      <td><input type="number" name="reorder_point" value={editFormData.reorder_point} onChange={handleEditChange} style={{width:'60px'}}/></td>
                      <td><input type="number" name="order_quantity" value={editFormData.order_quantity} onChange={handleEditChange} style={{width:'60px'}}/></td>
                      <td><input type="number" name="holding_cost" step="0.01" value={editFormData.holding_cost} onChange={handleEditChange} style={{width:'60px'}}/></td>
                      <td><input type="number" name="backorder_cost" step="0.01" value={editFormData.backorder_cost} onChange={handleEditChange} style={{width:'60px'}}/></td>
                      <td>
                        <button onClick={handleSaveClick} style={{ backgroundColor: 'green', color: 'white', cursor: 'pointer', marginRight: '5px' }}>Save</button>
                        <button onClick={handleCancelClick} style={{ cursor: 'pointer' }}>Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.sku}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.name}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.on_hand_stock}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.reorder_point}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.order_quantity}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>${item.holding_cost.toFixed(2)}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>${item.backorder_cost.toFixed(2)}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        <button onClick={() => handleEditClick(item)} style={{ cursor: 'pointer' }}>Edit</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
