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
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "", sku: "", category: "FOODS", on_hand_stock: 0, reorder_point: 50, safety_stock: 20, order_quantity: 100, holding_cost: 0.10, backorder_cost: 5.00
  });

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

  // --- Simulation Handlers ---
  const handleSimChange = (e) => {
    const { name, value } = e.target;
    setParams({ ...params, [name]: parseFloat(value) });
  };

  const runSimulation = async () => {
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
        alert(errorData.detail || "Failed to add item."); 
      }
    } catch (err) { alert("Error adding item."); }
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
                  <label>Item Name:<br/><input type="text" name="name" onChange={handleAddChange} style={{width:'90%'}}/></label>
                  <label>SKU:<br/><input type="text" name="sku" onChange={handleAddChange} style={{width:'90%'}}/></label>
                  <label>Category:<br/>
                    <select name="category" onChange={handleAddChange} style={{width:'96%'}}>
                      <option value="FOODS">FOODS</option>
                      <option value="HOBBIES">HOBBIES</option>
                      <option value="HOUSEHOLD">HOUSEHOLD</option>
                    </select>
                  </label>
                  <label>Current Stock:<br/><input type="number" name="on_hand_stock" onChange={handleAddChange} style={{width:'90%'}}/></label>
                  <label>Reorder Level:<br/><input type="number" name="reorder_point" onChange={handleAddChange} style={{width:'90%'}}/></label>
                  <label>Safety Stock:<br/><input type="number" name="safety_stock" onChange={handleAddChange} style={{width:'90%'}}/></label>
                </div>
                
                <h4 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>AI Simulation Parameters</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                  <label>Holding Cost ($):<br/><input type="number" step="0.01" name="holding_cost" onChange={handleAddChange} style={{width:'90%'}}/></label>
                  <label>Backorder Penalty ($):<br/><input type="number" step="0.01" name="backorder_cost" onChange={handleAddChange} style={{width:'90%'}}/></label>
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
