import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import InventoryView from './components/InventoryView';
import SimulationView from './components/SimulationView';
import WhatIfView from './components/WhatIfView';
import ForecastView from './components/ForecastView';
import ReportsView from './components/ReportsView';
import { RefreshIcon } from './components/Icons';

function App() {
  // Navigation State (defaults to 'inventory')
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
    name: "",
    sku: "",
    category: "FOODS",
    on_hand_stock: 0,
    reorder_point: 50,
    safety_stock: 20,
    order_quantity: 100,
    holding_cost: 0.10,
    backorder_cost: 5.00
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
      {/* Top Header Bar */}
      <Navbar />

      {/* Main App Body */}
      <div className="app-body">
        {/* Left Sidebar Navigation */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content Workspace */}
        <main className="main-content">
          {/* Header Row */}
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

          {/* Tab Views */}
          {activeTab === 'dashboard' && (
            <DashboardView setActiveTab={setActiveTab} />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              filteredInventory={filteredInventory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              showAddModal={showAddModal}
              setShowAddModal={setShowAddModal}
              addFormData={addFormData}
              handleAddChange={handleAddChange}
              handleAddSubmit={handleAddSubmit}
              editingId={editingId}
              editFormData={editFormData}
              handleEditClick={handleEditClick}
              handleEditChange={handleEditChange}
              handleSaveClick={handleSaveClick}
              handleCancelClick={handleCancelClick}
              handleDeleteClick={handleDeleteClick}
            />
          )}

          {activeTab === 'simulation' && (
            <SimulationView
              params={params}
              handleSimChange={handleSimChange}
              runSimulation={runSimulation}
              loading={loading}
              error={error}
              results={results}
              inventory={inventory}
            />
          )}

          {activeTab === 'whatif' && (
            <WhatIfView
              params={params}
              handleSimChange={handleSimChange}
              runSimulation={runSimulation}
              loading={loading}
              error={error}
              results={results}
              inventory={inventory}
            />
          )}

          {activeTab === 'forecast' && (
            <ForecastView />
          )}

          {activeTab === 'reports' && (
            <ReportsView />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
