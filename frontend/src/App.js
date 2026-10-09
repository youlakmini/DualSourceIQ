import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('simulation');
  
  // Simulation State
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({
    sku: "",
    regular_lead_time_mean: 7,
    regular_lead_time_std: 2.0,
    regular_unit_cost: 8.0,
    emergency_lead_time_mean: 2,
    emergency_lead_time_std: 0.0,
    emergency_unit_cost: 18.0,
    risk_aversion: 0.5,
    demand_modifier_pct: 0,
    min_service_level: 0.95
  });

  // Inventory State
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "", sku: "", category: "FOODS", on_hand_stock: 0, reorder_point: 50, safety_stock: 20, order_quantity: 100, holding_cost: 0.10, backorder_cost: 5.00
  });

  // Fetch Inventory on load
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/inventory');
      const data = await response.json();
      setInventory(data);
      if (data.length > 0 && !params.sku) {
          setParams(p => ({...p, sku: data[0].sku}));
      }
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
    }
  };

  // --- Simulation Handlers ---
  const handleSimChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = name === 'sku' ? value : (value === '' ? '' : parseFloat(value));
    setParams({ ...params, [name]: parsedValue });
  };

  const runSimulation = async () => {
    // --- Front-end Validations ---
    if (params.risk_aversion < 0 || params.risk_aversion > 1) {
      alert("Error: Risk Aversion must be between 0 and 1.");
      return;
    }
    if (params.regular_unit_cost <= 0 || params.emergency_unit_cost <= 0) {
      alert("Error: Supplier Costs must be greater than $0.");
      return;
    }
    if (params.regular_lead_time_mean < 0 || params.emergency_lead_time_mean < 0) {
      alert("Error: Supplier Lead Times cannot be negative.");
      return;
    }
    if (params.regular_lead_time_std < 0 || params.emergency_lead_time_std < 0) {
      alert("Error: Standard Deviation cannot be negative.");
      return;
    }

    setLoading(true); setError(null); setResults(null);
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

  // --- Inventory Editing & Deleting ---
  const handleEditClick = (item) => {
    setEditingId(item.id);
    setEditFormData(item);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = (name === 'sku' || name === 'name' || name === 'category') ? value : parseFloat(value);
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
        fetchInventory();
      } else { alert("Failed to save item."); }
    } catch (err) { alert("Error saving item."); }
  };

  const handleCancelClick = () => {
    setEditingId(null);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await fetch(`http://localhost:8000/api/inventory/${id}`, { method: 'DELETE' });
        fetchInventory();
      } catch (err) { alert("Error deleting item."); }
    }
  };

  // --- Inventory Adding ---
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = (name === 'sku' || name === 'name' || name === 'category') ? value : parseFloat(value);
    setAddFormData({ ...addFormData, [name]: parsedValue });
  };

  const handleAddSubmit = async () => {
    // 1. Required Fields Validation
    if (!addFormData.name.trim() || !addFormData.sku.trim()) {
      alert("Error: Item Name and SKU are required.");
      return;
    }

    // 2. Numeric Constraints (No negative numbers, Costs must be > 0)
    if (addFormData.on_hand_stock < 0 || addFormData.reorder_point < 0 || addFormData.safety_stock < 0) {
      alert("Error: Stock levels cannot be negative.");
      return;
    }
    if (addFormData.holding_cost <= 0 || addFormData.backorder_cost <= 0) {
      alert("Error: Holding Cost and Backorder Penalty must be greater than $0.00.");
      return;
    }

    // 3. Business Logic
    if (addFormData.safety_stock >= addFormData.reorder_point) {
      alert("Error: Reorder Level must be strictly greater than Safety Stock.");
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addFormData),
      });
      if (response.ok) {
        setShowAddModal(false);
        fetchInventory();
      } else { 
        const errorData = await response.json();
        alert(`Error: ${errorData.detail || "Failed to add item."}`); 
      }
    } catch (err) { alert("Error connecting to server."); }
  };

  // Filter Inventory based on Search
  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <label>Select Product: 
                <select name="sku" value={params.sku} onChange={handleSimChange} style={{width:'100%', padding:'5px', marginTop:'5px'}}>
                   {inventory.map(item => (
                       <option key={item.sku} value={item.sku}>{item.name}</option>
                   ))}
                </select>
              </label>
              <label>Risk Aversion (0-1): <input type="number" step="0.1" min="0" max="1" name="risk_aversion" value={params.risk_aversion} onChange={handleSimChange} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}/></label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginTop: '10px' }}>
              <label>Demand Change (%): <input type="number" step="1" name="demand_modifier_pct" value={params.demand_modifier_pct} onChange={handleSimChange} placeholder="e.g. 20 for +20%"/></label>
            </div>
            <h4 style={{ marginTop: '20px' }}>Regular Supplier</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
               <label>Cost ($): <input type="number" min="0" name="regular_unit_cost" value={params.regular_unit_cost} onChange={handleSimChange} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}/></label>
               <label>Lead Time: <input type="number" min="0" name="regular_lead_time_mean" value={params.regular_lead_time_mean} onChange={handleSimChange} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}/></label>
               <label>Std Dev: <input type="number" step="0.5" min="0" name="regular_lead_time_std" value={params.regular_lead_time_std} onChange={handleSimChange} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}/></label>
            </div>
            <h4 style={{ marginTop: '20px' }}>Emergency Supplier</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
               <label>Cost ($): <input type="number" min="0" name="emergency_unit_cost" value={params.emergency_unit_cost} onChange={handleSimChange} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}/></label>
               <label>Lead Time: <input type="number" min="0" name="emergency_lead_time_mean" value={params.emergency_lead_time_mean} onChange={handleSimChange} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}/></label>
               <label>Std Dev: <input type="number" step="0.5" min="0" name="emergency_lead_time_std" value={params.emergency_lead_time_std} onChange={handleSimChange} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}/></label>
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
                  <p style={{ marginTop: '15px', fontWeight: 'bold' }}>
                    Objective Score (E[Cost] + λ*CVaR): {results.best_plan.risk_adjusted_score.toFixed(2)}
                  </p>
                </div>
                
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fdfd96', borderLeft: '6px solid #f39c12' }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>Simulation Insights (100 Runs)</h4>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}>Average Yearly Demand: {Math.round(results.best_plan.average_yearly_demand)} units</p>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}>Max Delay (Regular Supplier): {results.best_plan.max_regular_delay} days</p>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}>Max Delay (Emergency Supplier): {results.best_plan.max_emergency_delay} days</p>
                  <p style={{ margin: '5px 0', fontSize: '14px' }}>Stockout Probability: {(results.best_plan.stockout_prob * 100).toFixed(1)}%</p>
                </div>
                
                {results.all_plans && (
                  <div style={{ marginTop: '20px' }}>
                    <h4>Compare Sourcing Strategies (UC05.1)</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
                          <th style={{ padding: '8px', border: '1px solid #ddd' }}>Strategy (Reg/Emg)</th>
                          <th style={{ padding: '8px', border: '1px solid #ddd' }}>Expected Cost</th>
                          <th style={{ padding: '8px', border: '1px solid #ddd' }}>Service Level</th>
                          <th style={{ padding: '8px', border: '1px solid #ddd' }}>Risk Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.all_plans.filter(p => p.primary_ratio === 1.0 || p.primary_ratio === 0.0 || p.primary_ratio === 0.5 || p.primary_ratio === results.best_plan.primary_ratio).map((plan, idx) => {
                          const isBest = plan.primary_ratio === results.best_plan.primary_ratio;
                          const name = plan.primary_ratio === 1.0 ? 'Reg Only (100/0)' : 
                                       plan.primary_ratio === 0.0 ? 'Emg Only (0/100)' : 
                                       plan.primary_ratio === 0.5 ? 'Balanced (50/50)' : 
                                       `Risk-Aware (${Math.round(plan.primary_ratio*100)}/${Math.round((1-plan.primary_ratio)*100)})`;
                          
                          return (
                            <tr key={idx} style={{ backgroundColor: isBest ? '#e7f3fe' : 'transparent', fontWeight: isBest ? 'bold' : 'normal' }}>
                              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{name} {isBest ? '⭐' : ''}</td>
                              <td style={{ padding: '8px', border: '1px solid #ddd' }}>${plan.expected_cost.toFixed(2)}</td>
                              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{(plan.expected_fill_rate * 100).toFixed(1)}%</td>
                              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{plan.risk_adjusted_score.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- INVENTORY MANAGEMENT TAB --- */}
      {activeTab === 'inventory' && (
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Inventory Data Management</h3>
            <div>
                <input 
                  type="text" 
                  placeholder="Search by SKU or Name..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ padding: '8px', marginRight: '15px', width: '250px' }}
                />
                <button 
                  onClick={() => setShowAddModal(true)}
                  style={{ padding: '8px 15px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  + Add New Item
                </button>
            </div>
          </div>

          {/* Add Item Modal */}
          {showAddModal && (
            <div style={{ position: 'fixed', top: '0', left: '0', right: '0', bottom: '0', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '500px' }}>
                <h3 style={{ marginTop: '0', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>Add Inventory Item</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                  <label>Item Name:<br/><input type="text" name="name" value={addFormData.name} onChange={handleAddChange} style={{width:'90%'}}/></label>
                  <label>SKU:<br/><input type="text" name="sku" value={addFormData.sku} onChange={handleAddChange} style={{width:'90%'}}/></label>
                  <label>Category:<br/>
                    <select name="category" value={addFormData.category} onChange={handleAddChange} style={{width:'96%'}}>
                      <option value="FOODS">FOODS</option>
                      <option value="HOBBIES">HOBBIES</option>
                      <option value="HOUSEHOLD">HOUSEHOLD</option>
                    </select>
                  </label>
                  <label>Current Stock:<br/><input type="number" name="on_hand_stock" value={addFormData.on_hand_stock} onChange={handleAddChange} style={{width:'90%'}}/></label>
                  <label>Reorder Level:<br/><input type="number" name="reorder_point" value={addFormData.reorder_point} onChange={handleAddChange} style={{width:'90%'}}/></label>
                  <label>Safety Stock:<br/><input type="number" name="safety_stock" value={addFormData.safety_stock} onChange={handleAddChange} style={{width:'90%'}}/></label>
                </div>
                
                <h4 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>AI Simulation Parameters</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                  <label>Holding Cost ($):<br/><input type="number" step="0.01" name="holding_cost" value={addFormData.holding_cost} onChange={handleAddChange} style={{width:'90%'}}/></label>
                  <label>Backorder Penalty ($):<br/><input type="number" step="0.01" name="backorder_cost" value={addFormData.backorder_cost} onChange={handleAddChange} style={{width:'90%'}}/></label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button onClick={() => setShowAddModal(false)} style={{ padding: '8px 15px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '4px' }}>Cancel</button>
                  <button onClick={handleAddSubmit} style={{ padding: '8px 15px', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save Item</button>
                </div>
              </div>
            </div>
          )}

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', color: '#555' }}>
                <th style={{ padding: '15px 10px' }}>Item</th>
                <th style={{ padding: '15px 10px' }}>SKU</th>
                <th style={{ padding: '15px 10px' }}>Current Stock</th>
                <th style={{ padding: '15px 10px' }}>Reorder Level</th>
                <th style={{ padding: '15px 10px' }}>Safety Stock</th>
                <th style={{ padding: '15px 10px' }}>Status</th>
                <th style={{ padding: '15px 10px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => {
                let statusText = "Healthy";
                let statusColor = "#2eec96"; // Green
                if (item.on_hand_stock <= item.safety_stock) {
                    statusText = "At Risk";
                    statusColor = "#f54242"; // Red
                } else if (item.on_hand_stock <= item.reorder_point) {
                    statusText = "Low Stock";
                    statusColor = "#f59f42"; // Orange
                }

                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f2f2f2' }}>
                    {editingId === item.id ? (
                      <td colSpan="7" style={{ padding: '15px', backgroundColor: '#f9f9f9' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                          <label><strong>Name:</strong> <input type="text" name="name" value={editFormData.name} onChange={handleEditChange} style={{width:'90%'}} /></label>
                          <label><strong>SKU:</strong> <input type="text" name="sku" value={editFormData.sku} onChange={handleEditChange} style={{width:'90%'}} /></label>
                          <label><strong>Category:</strong>
                              <select name="category" value={editFormData.category} onChange={handleEditChange} style={{width:'95%'}}>
                                <option value="FOODS">FOODS</option>
                                <option value="HOBBIES">HOBBIES</option>
                                <option value="HOUSEHOLD">HOUSEHOLD</option>
                              </select>
                          </label>
                          <label><strong>Current Stock:</strong> <input type="number" name="on_hand_stock" value={editFormData.on_hand_stock} onChange={handleEditChange} style={{width:'90%'}}/></label>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                          <label><strong>Reorder Level:</strong> <input type="number" name="reorder_point" value={editFormData.reorder_point} onChange={handleEditChange} style={{width:'90%'}}/></label>
                          <label><strong>Safety Stock:</strong> <input type="number" name="safety_stock" value={editFormData.safety_stock} onChange={handleEditChange} style={{width:'90%'}}/></label>
                          <label><strong>Holding Cost:</strong> <input type="number" name="holding_cost" step="0.01" value={editFormData.holding_cost} onChange={handleEditChange} style={{width:'90%'}}/></label>
                          <label><strong>Backorder Cost:</strong> <input type="number" name="backorder_cost" step="0.01" value={editFormData.backorder_cost} onChange={handleEditChange} style={{width:'90%'}}/></label>
                        </div>
                        <button onClick={handleSaveClick} style={{ backgroundColor: 'green', color: 'white', cursor: 'pointer', marginRight: '10px', padding: '5px 15px', border: 'none', borderRadius: '4px' }}>Save</button>
                        <button onClick={handleCancelClick} style={{ cursor: 'pointer', padding: '5px 15px', border: '1px solid #ccc', borderRadius: '4px' }}>Cancel</button>
                      </td>
                    ) : (
                      <>
                        <td style={{ padding: '15px 10px' }}>{item.name}</td>
                        <td style={{ padding: '15px 10px', color: '#777' }}>{item.sku.substring(0, 15)}...</td>
                        <td style={{ padding: '15px 10px' }}>{item.on_hand_stock}</td>
                        <td style={{ padding: '15px 10px' }}>{item.reorder_point}</td>
                        <td style={{ padding: '15px 10px' }}>{item.safety_stock}</td>
                        <td style={{ padding: '15px 10px' }}>
                          <span style={{ 
                            display: 'inline-block', 
                            width: '12px', height: '12px', 
                            backgroundColor: statusColor, 
                            borderRadius: '50%', 
                            marginRight: '8px',
                            verticalAlign: 'middle'
                          }}></span>
                          {statusText}
                        </td>
                        <td style={{ padding: '15px 10px' }}>
                          <button onClick={() => handleEditClick(item)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#007BFF', textDecoration: 'underline' }}>Edit / View</button>
                          <span style={{ margin: '0 8px', color: '#ccc' }}>|</span>
                          <button onClick={() => handleDeleteClick(item.id)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'red', textDecoration: 'underline' }}>Delete</button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredInventory.length === 0 && <p style={{textAlign: 'center', color: '#777'}}>No items found matching your search.</p>}
        </div>
      )}
    </div>
  );
}

export default App;
