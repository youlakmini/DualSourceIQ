import React, { useState, useEffect } from 'react';
import './App.css';

// --- SVG Icons ---
const CubeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

const BellIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9"></rect>
    <rect x="14" y="3" width="7" height="5"></rect>
    <rect x="14" y="12" width="7" height="9"></rect>
    <rect x="3" y="16" width="7" height="5"></rect>
  </svg>
);

const BoxIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8"></polyline>
    <rect x="1" y="3" width="22" height="5"></rect>
    <line x1="10" y1="12" x2="14" y2="12"></line>
  </svg>
);

const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const TrendingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

const FlaskIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2v7.31L4.69 19.34A2 2 0 0 0 6.43 22h11.14a2 2 0 0 0 1.74-2.66L14 9.31V2"></path>
    <line x1="8.5" y1="2" x2="15.5" y2="2"></line>
    <line x1="14" y1="9" x2="10" y2="9"></line>
  </svg>
);

const FileTextIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
);

function App() {
  // Navigation State
  // Default to 'inventory' as requested ("don't create a dashboard for now")
  const [activeTab, setActiveTab] = useState('inventory');
  
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/inventory');
      const data = await response.json();
      setInventory(data);
      if (data.length > 0 && !params.sku) {
        setParams(p => ({ ...p, sku: data[0].sku }));
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
    if (params.demand_modifier_pct <= -100) {
      alert("Error: Demand Change cannot be -100% or lower (demand cannot be negative).");
      return;
    }
    if (params.demand_modifier_pct > 500) {
      alert("Error: Demand Change is too high. Please keep it under +500%.");
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
      } else { 
        alert("Failed to save item."); 
      }
    } catch (err) { 
      alert("Error saving item."); 
    }
  };

  const handleCancelClick = () => {
    setEditingId(null);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await fetch(`http://localhost:8000/api/inventory/${id}`, { method: 'DELETE' });
        fetchInventory();
      } catch (err) { 
        alert("Error deleting item."); 
      }
    }
  };

  // --- Inventory Adding ---
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = (name === 'sku' || name === 'name' || name === 'category') ? value : parseFloat(value);
    setAddFormData({ ...addFormData, [name]: parsedValue });
  };

  const handleAddSubmit = async () => {
    if (!addFormData.name.trim() || !addFormData.sku.trim()) {
      alert("Error: Item Name and SKU are required.");
      return;
    }
    if (addFormData.on_hand_stock < 0 || addFormData.reorder_point < 0 || addFormData.safety_stock < 0) {
      alert("Error: Stock levels cannot be negative.");
      return;
    }
    if (addFormData.holding_cost <= 0 || addFormData.backorder_cost <= 0) {
      alert("Error: Holding Cost and Backorder Penalty must be greater than $0.00.");
      return;
    }
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
    } catch (err) { 
      alert("Error connecting to server."); 
    }
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="top-navbar">
        <div className="brand-section">
          <div className="brand-logo-icon">
            <CubeIcon />
          </div>
          <span className="brand-title">Smart Dual-Supplier Inventory Decision Support System</span>
        </div>
        <div className="navbar-actions">
          <button className="notification-btn" title="Notifications">
            <BellIcon />
            <span className="notification-badge">3</span>
          </button>
          <div className="user-profile-widget">
            <div className="user-avatar-circle">
              <UserIcon />
            </div>
            <span className="user-name-text">Inventory Manager</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#94a3b8' }}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar + Workspace */}
      <div className="app-body">
        {/* Left Sidebar */}
        <aside className="app-sidebar">
          <nav className="sidebar-nav-list">
            <button 
              className={`sidebar-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <DashboardIcon />
              <span>Dashboard</span>
            </button>

            <button 
              className={`sidebar-nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventory')}
            >
              <BoxIcon />
              <span>Manage Inventory Data</span>
            </button>

            <button 
              className={`sidebar-nav-item ${activeTab === 'simulation' ? 'active' : ''}`}
              onClick={() => setActiveTab('simulation')}
            >
              <UsersIcon />
              <span>Manage Supplier Parameters</span>
            </button>

            <button 
              className={`sidebar-nav-item ${activeTab === 'forecast' ? 'active' : ''}`}
              onClick={() => setActiveTab('forecast')}
            >
              <TrendingIcon />
              <span>View Demand Forecast</span>
            </button>

            <button 
              className={`sidebar-nav-item ${activeTab === 'whatif' ? 'active' : ''}`}
              onClick={() => setActiveTab('whatif')}
            >
              <FlaskIcon />
              <span>Run What-if Analysis</span>
            </button>

            <button 
              className={`sidebar-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <FileTextIcon />
              <span>Reports & Metrics</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <div className="user-avatar-circle" style={{ width: '32px', height: '32px' }}>
              <UserIcon />
            </div>
            <div className="sidebar-footer-info">
              <span className="sidebar-footer-name">Inventory Manager</span>
              <span className="sidebar-footer-role">Inventory Management</span>
            </div>
          </div>
        </aside>

        {/* Content Workspace */}
        <main className="main-content">
          {/* Page Top Header */}
          <div className="page-header-row">
            <div>
              <h1 className="page-title">
                {activeTab === 'dashboard' && 'Inventory Manager Dashboard'}
                {activeTab === 'inventory' && 'Manage Inventory Data (UC02)'}
                {activeTab === 'simulation' && 'Manage Supplier Parameters & Risk Simulation (UC07)'}
                {activeTab === 'whatif' && 'Run What-if Analysis (UC05)'}
                {activeTab === 'forecast' && 'Demand Forecast'}
                {activeTab === 'reports' && 'Reports & Performance Metrics'}
              </h1>
              <p className="page-subtitle">
                Monitor inventory, suppliers and demand forecasts to make better decisions.
              </p>
            </div>
            <div className="header-status-badge">
              <span>Last Updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <button className="refresh-button" onClick={fetchInventory} title="Refresh data">
                <RefreshIcon />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* --- TAB 1: DASHBOARD PLACEHOLDER (AS REQUESTED: DON'T CREATE DASHBOARD FOR NOW) --- */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ maxWidth: '520px', margin: '0 auto' }}>
                <div style={{ width: '56px', height: '56px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <DashboardIcon />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>Overview Dashboard In Progress</h2>
                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                  The central KPI overview dashboard is currently queued for the next release. Please use the options in the sidebar to manage your items or run simulations.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button className="btn-primary" onClick={() => setActiveTab('inventory')}>
                    <BoxIcon />
                    <span>Manage Inventory Data</span>
                  </button>
                  <button className="btn-secondary" onClick={() => setActiveTab('whatif')}>
                    <FlaskIcon />
                    <span>Run What-if Analysis</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 2: INVENTORY MANAGEMENT TAB (UC02) --- */}
          {activeTab === 'inventory' && (
            <div className="dashboard-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 className="card-title" style={{ margin: 0 }}>Inventory Stock Overview</h3>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>Showing {filteredInventory.length} configured inventory items</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="Search by SKU or Name..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '260px' }}
                  />
                  <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                    <span>+ Add New Item</span>
                  </button>
                </div>
              </div>

              {/* Add Item Modal */}
              {showAddModal && (
                <div className="modal-overlay">
                  <div className="modal-dialog">
                    <div className="modal-header">
                      <h3>Add Inventory Item</h3>
                      <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
                    </div>
                    <div className="modal-body">
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                        <div className="form-group">
                          <label className="form-label">Item Name</label>
                          <input type="text" className="form-input" name="name" value={addFormData.name} onChange={handleAddChange} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">SKU</label>
                          <input type="text" className="form-input" name="sku" value={addFormData.sku} onChange={handleAddChange} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Category</label>
                          <select className="form-select" name="category" value={addFormData.category} onChange={handleAddChange}>
                            <option value="FOODS">FOODS</option>
                            <option value="HOBBIES">HOBBIES</option>
                            <option value="HOUSEHOLD">HOUSEHOLD</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Current Stock</label>
                          <input type="number" min="0" className="form-input" name="on_hand_stock" value={addFormData.on_hand_stock} onChange={handleAddChange} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Reorder Level</label>
                          <input type="number" min="0" className="form-input" name="reorder_point" value={addFormData.reorder_point} onChange={handleAddChange} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Safety Stock</label>
                          <input type="number" min="0" className="form-input" name="safety_stock" value={addFormData.safety_stock} onChange={handleAddChange} />
                        </div>
                      </div>

                      <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', margin: '0 0 12px 0', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                        Simulation & Cost Parameters
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div className="form-group">
                          <label className="form-label">Holding Cost ($/unit/day)</label>
                          <input type="number" step="0.01" min="0" className="form-input" name="holding_cost" value={addFormData.holding_cost} onChange={handleAddChange} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Backorder Penalty ($/unit/day)</label>
                          <input type="number" step="0.01" min="0" className="form-input" name="backorder_cost" value={addFormData.backorder_cost} onChange={handleAddChange} />
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                      <button className="btn-primary" onClick={handleAddSubmit}>Save Item</button>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ overflowX: 'auto' }}>
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>SKU</th>
                      <th>Current Stock</th>
                      <th>Reorder Level</th>
                      <th>Safety Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((item) => {
                      let statusText = "Healthy";
                      let badgeClass = "badge-healthy";
                      let dotClass = "dot-healthy";
                      if (item.on_hand_stock <= item.safety_stock) {
                        statusText = "At Risk";
                        badgeClass = "badge-at-risk";
                        dotClass = "dot-at-risk";
                      } else if (item.on_hand_stock <= item.reorder_point) {
                        statusText = "Low Stock";
                        badgeClass = "badge-low-stock";
                        dotClass = "dot-low-stock";
                      }

                      return (
                        <tr key={item.id}>
                          {editingId === item.id ? (
                            <td colSpan="7" style={{ padding: '16px', backgroundColor: '#f8fafc' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                                <label className="form-group"><span className="form-label">Name</span><input type="text" className="form-input" name="name" value={editFormData.name} onChange={handleEditChange} /></label>
                                <label className="form-group"><span className="form-label">SKU</span><input type="text" className="form-input" name="sku" value={editFormData.sku} onChange={handleEditChange} /></label>
                                <label className="form-group"><span className="form-label">Category</span>
                                  <select className="form-select" name="category" value={editFormData.category} onChange={handleEditChange}>
                                    <option value="FOODS">FOODS</option>
                                    <option value="HOBBIES">HOBBIES</option>
                                    <option value="HOUSEHOLD">HOUSEHOLD</option>
                                  </select>
                                </label>
                                <label className="form-group"><span className="form-label">Current Stock</span><input type="number" className="form-input" name="on_hand_stock" value={editFormData.on_hand_stock} onChange={handleEditChange} /></label>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                                <label className="form-group"><span className="form-label">Reorder Level</span><input type="number" className="form-input" name="reorder_point" value={editFormData.reorder_point} onChange={handleEditChange} /></label>
                                <label className="form-group"><span className="form-label">Safety Stock</span><input type="number" className="form-input" name="safety_stock" value={editFormData.safety_stock} onChange={handleEditChange} /></label>
                                <label className="form-group"><span className="form-label">Holding Cost ($)</span><input type="number" step="0.01" className="form-input" name="holding_cost" value={editFormData.holding_cost} onChange={handleEditChange} /></label>
                                <label className="form-group"><span className="form-label">Backorder Penalty ($)</span><input type="number" step="0.01" className="form-input" name="backorder_cost" value={editFormData.backorder_cost} onChange={handleEditChange} /></label>
                              </div>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn-primary" style={{ padding: '6px 16px', fontSize: '13px' }} onClick={handleSaveClick}>Save</button>
                                <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '13px' }} onClick={handleCancelClick}>Cancel</button>
                              </div>
                            </td>
                          ) : (
                            <>
                              <td style={{ fontWeight: '600' }}>{item.name}</td>
                              <td style={{ color: '#64748b', fontFamily: 'monospace' }}>{item.sku.substring(0, 16)}</td>
                              <td><strong>{item.on_hand_stock}</strong> units</td>
                              <td>{item.reorder_point}</td>
                              <td>{item.safety_stock}</td>
                              <td>
                                <span className={`badge-pill ${badgeClass}`}>
                                  <span className={`status-dot ${dotClass}`}></span>
                                  {statusText}
                                </span>
                              </td>
                              <td>
                                <button onClick={() => handleEditClick(item)} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '500', cursor: 'pointer', marginRight: '10px' }}>Edit</button>
                                <span style={{ color: '#cbd5e1' }}>|</span>
                                <button onClick={() => handleDeleteClick(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: '500', cursor: 'pointer', marginLeft: '10px' }}>Delete</button>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredInventory.length === 0 && (
                  <p style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No inventory items matched your search query.</p>
                )}
              </div>
            </div>
          )}

          {/* --- TAB 3: SIMULATION & SUPPLIER PARAMETERS (UC07) --- */}
          {activeTab === 'simulation' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.2fr', gap: '24px' }}>
              {/* Parameters Column */}
              <div className="dashboard-card">
                <h3 className="card-title">Simulation Parameters</h3>
                <p className="card-subtitle">Tune stochastic supplier parameters and risk aversion</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '14px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Select Target Product</label>
                    <select className="form-select" name="sku" value={params.sku} onChange={handleSimChange}>
                      {inventory.map(item => (
                        <option key={item.sku} value={item.sku}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Risk Aversion (0-1)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="1" 
                      className="form-input" 
                      name="risk_aversion" 
                      value={params.risk_aversion} 
                      onChange={handleSimChange} 
                      onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                    />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginBottom: '18px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', margin: '0 0 10px 0' }}>Regular Supplier (Primary)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Unit Cost ($)</label>
                      <input type="number" min="0" className="form-input" name="regular_unit_cost" value={params.regular_unit_cost} onChange={handleSimChange} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mean Lead Time</label>
                      <input type="number" min="0" className="form-input" name="regular_lead_time_mean" value={params.regular_lead_time_mean} onChange={handleSimChange} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Std Dev (Days)</label>
                      <input type="number" step="0.5" min="0" className="form-input" name="regular_lead_time_std" value={params.regular_lead_time_std} onChange={handleSimChange} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} />
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', margin: '0 0 10px 0' }}>Emergency Supplier (Backup)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Unit Cost ($)</label>
                      <input type="number" min="0" className="form-input" name="emergency_unit_cost" value={params.emergency_unit_cost} onChange={handleSimChange} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mean Lead Time</label>
                      <input type="number" min="0" className="form-input" name="emergency_lead_time_mean" value={params.emergency_lead_time_mean} onChange={handleSimChange} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Std Dev (Days)</label>
                      <input type="number" step="0.5" min="0" className="form-input" name="emergency_lead_time_std" value={params.emergency_lead_time_std} onChange={handleSimChange} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} />
                    </div>
                  </div>
                </div>

                <button className="btn-primary" onClick={runSimulation} disabled={loading} style={{ width: '100%', padding: '12px' }}>
                  {loading ? 'Running 100 Monte Carlo Iterations...' : 'Run Risk-Aware Simulation (UC07)'}
                </button>
                {error && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '12px' }}>Error: {error}</p>}
              </div>

              {/* Recommendation Results Column */}
              <div className="dashboard-card">
                <h3 className="card-title">Recommendation Results</h3>
                <p className="card-subtitle">Optimal dual-sourcing allocation output</p>

                {!results && (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                    <FlaskIcon />
                    <p style={{ marginTop: '12px', fontSize: '14px' }}>Configure your parameters on the left and click "Run Risk-Aware Simulation" to see recommendations.</p>
                  </div>
                )}

                {results && (
                  <div>
                    {/* Blue Hero Result Card */}
                    <div style={{ padding: '20px', backgroundColor: '#eff6ff', borderRadius: '8px', borderLeft: '5px solid #2563eb', marginBottom: '20px' }}>
                      <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1d4ed8', fontWeight: '700' }}>Recommended Strategy</span>
                      <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1e3a8a', margin: '6px 0 16px 0' }}>
                        Optimal Split: {Math.round(results.best_plan.primary_ratio * 100)}% Regular / {Math.round((1 - results.best_plan.primary_ratio) * 100)}% Emergency
                      </h2>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '14px' }}>
                        <div>
                          <span style={{ color: '#64748b' }}>Expected Cost:</span>
                          <p style={{ margin: '2px 0 0 0', fontWeight: '700', fontSize: '16px', color: '#0f172a' }}>
                            ${results.best_plan.expected_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>Worst 5% Risk (CVaR):</span>
                          <p style={{ margin: '2px 0 0 0', fontWeight: '700', fontSize: '16px', color: '#0f172a' }}>
                            ${results.best_plan.cvar.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>Service Level (Fill Rate):</span>
                          <p style={{ margin: '2px 0 0 0', fontWeight: '700', fontSize: '16px', color: '#15803d' }}>
                            {(results.best_plan.expected_fill_rate * 100).toFixed(2)}%
                          </p>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>Objective Function:</span>
                          <p style={{ margin: '2px 0 0 0', fontWeight: '700', fontSize: '16px', color: '#0f172a' }}>
                            {results.best_plan.risk_adjusted_score.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Amber Simulation Insights */}
                    <div style={{ padding: '18px', backgroundColor: '#fffbeb', borderRadius: '8px', borderLeft: '5px solid #f59e0b' }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#92400e', fontWeight: '700' }}>
                        Simulation Insights (100 Monte Carlo Runs)
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13.5px', color: '#78350f' }}>
                        <div>Average Yearly Demand: <strong>{Math.round(results.best_plan.average_yearly_demand)} units</strong></div>
                        <div>Stockout Probability: <strong>{(results.best_plan.stockout_prob * 100).toFixed(1)}%</strong></div>
                        <div>Max Regular Supplier Delay: <strong>{results.best_plan.max_regular_delay} days</strong></div>
                        <div>Max Emergency Supplier Delay: <strong>{results.best_plan.max_emergency_delay} days</strong></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- TAB 4: WHAT-IF ANALYSIS (UC05) --- */}
          {activeTab === 'whatif' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="dashboard-card">
                <h3 className="card-title">What-If Scenario Simulation</h3>
                <p className="card-subtitle">Stress-test inventory policies under demand surges and lead-time disruptions</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Target Product</label>
                    <select className="form-select" name="sku" value={params.sku} onChange={handleSimChange}>
                      {inventory.map(item => <option key={item.sku} value={item.sku}>{item.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Risk Aversion λ (0 - 1)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="1" 
                      className="form-input" 
                      name="risk_aversion" 
                      value={params.risk_aversion} 
                      onChange={handleSimChange} 
                      onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Demand Surge / Drop (%)</label>
                    <input 
                      type="number" 
                      step="1" 
                      min="-99" 
                      max="500" 
                      className="form-input" 
                      name="demand_modifier_pct" 
                      value={params.demand_modifier_pct} 
                      onChange={handleSimChange} 
                      placeholder="e.g. +20 for 20% spike" 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '18px', marginBottom: '20px' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', margin: '0 0 10px 0' }}>Regular Supplier Parameters</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="form-group">
                        <label className="form-label">Unit Cost ($)</label>
                        <input type="number" min="0" className="form-input" name="regular_unit_cost" value={params.regular_unit_cost} onChange={handleSimChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Mean Lead Time (Days)</label>
                        <input type="number" min="0" className="form-input" name="regular_lead_time_mean" value={params.regular_lead_time_mean} onChange={handleSimChange} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', margin: '0 0 10px 0' }}>Emergency Supplier Parameters</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="form-group">
                        <label className="form-label">Unit Cost ($)</label>
                        <input type="number" min="0" className="form-input" name="emergency_unit_cost" value={params.emergency_unit_cost} onChange={handleSimChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Mean Lead Time (Days)</label>
                        <input type="number" min="0" className="form-input" name="emergency_lead_time_mean" value={params.emergency_lead_time_mean} onChange={handleSimChange} />
                      </div>
                    </div>
                  </div>
                </div>

                <button className="btn-primary" onClick={runSimulation} disabled={loading} style={{ padding: '12px 24px', backgroundColor: '#f59e0b' }}>
                  {loading ? 'Evaluating Scenario Candidates...' : 'Run What-If Strategy Comparison (UC05.1)'}
                </button>
                {error && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '12px' }}>Error: {error}</p>}
              </div>

              <div className="dashboard-card">
                <h3 className="card-title">Compare Sourcing Strategies (UC05.1)</h3>
                <p className="card-subtitle">Comparison of baseline allocations vs. risk-optimized allocation</p>

                {!results && (
                  <p style={{ color: '#94a3b8', fontSize: '14px', padding: '20px 0' }}>Adjust what-if parameters above and click Run to see the strategy comparison table.</p>
                )}

                {results && results.all_plans && (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>Strategy (Reg / Emg)</th>
                          <th>Expected Cost</th>
                          <th>Service Level (Fill Rate)</th>
                          <th>Risk (Worst 5% CVaR)</th>
                          <th>Risk-Adjusted Objective</th>
                          <th>Recommendation Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.all_plans.filter(p => p.primary_ratio === 1.0 || p.primary_ratio === 0.0 || p.primary_ratio === 0.5 || p.primary_ratio === results.best_plan.primary_ratio).map((plan, idx) => {
                          const isBest = plan.primary_ratio === results.best_plan.primary_ratio;
                          const name = plan.primary_ratio === 1.0 ? 'Regular Only (100% / 0%)' : 
                                       plan.primary_ratio === 0.0 ? 'Emergency Only (0% / 100%)' : 
                                       plan.primary_ratio === 0.5 ? 'Balanced (50% / 50%)' : 
                                       `Risk-Aware (${Math.round(plan.primary_ratio*100)}% / ${Math.round((1-plan.primary_ratio)*100)}%)`;
                          
                          return (
                            <tr key={idx} style={{ backgroundColor: isBest ? '#eff6ff' : 'transparent', fontWeight: isBest ? '600' : 'normal' }}>
                              <td style={{ color: isBest ? '#1d4ed8' : 'inherit' }}>{name}</td>
                              <td>${plan.expected_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td style={{ color: plan.expected_fill_rate >= 0.95 ? '#166534' : '#991b1b', fontWeight: '600' }}>
                                {(plan.expected_fill_rate * 100).toFixed(1)}%
                              </td>
                              <td>${plan.cvar.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td>{plan.risk_adjusted_score.toFixed(2)}</td>
                              <td>
                                {isBest ? (
                                  <span className="badge-pill badge-healthy" style={{ padding: '4px 12px' }}>
                                    ⭐ Optimal Choice
                                  </span>
                                ) : (
                                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>Alternative</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- TAB 5: DEMAND FORECAST PLACEHOLDER --- */}
          {activeTab === 'forecast' && (
            <div className="dashboard-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ maxWidth: '480px', margin: '0 auto' }}>
                <div style={{ width: '56px', height: '56px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <TrendingIcon />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>Demand Forecast (XGBoost)</h2>
                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>
                  Interactive demand forecasting and trend charts for M5 Walmart products will be displayed here in the upcoming module.
                </p>
              </div>
            </div>
          )}

          {/* --- TAB 6: REPORTS & METRICS PLACEHOLDER --- */}
          {activeTab === 'reports' && (
            <div className="dashboard-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ maxWidth: '480px', margin: '0 auto' }}>
                <div style={{ width: '56px', height: '56px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <FileTextIcon />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>Reports & Performance Metrics</h2>
                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>
                  Exportable audit logs, supplier SLA tracking, and historical CVaR risk reports will be generated from this view.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
