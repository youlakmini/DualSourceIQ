import React from 'react';

function InventoryView({
  filteredInventory,
  searchQuery,
  setSearchQuery,
  showAddModal,
  setShowAddModal,
  addFormData,
  handleAddChange,
  handleAddSubmit,
  editingId,
  editFormData,
  handleEditClick,
  handleEditChange,
  handleSaveClick,
  handleCancelClick,
  handleDeleteClick
}) {
  return (
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
  );
}

export default InventoryView;
