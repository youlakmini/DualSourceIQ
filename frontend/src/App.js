import React, { useState } from 'react';
import './App.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Form State
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

  const handleChange = (e) => {
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

  return (
    <div className="App" style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Smart Dual-Supplier Inventory Decision Support System</h1>
      <p>Configure your parameters and run the risk-aware recommendation engine.</p>

      <div style={{ display: 'flex', gap: '20px' }}>
        
        {/* Configuration Panel */}
        <div style={{ flex: '1', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
          <h3>Simulation Parameters</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <label>Product Row Index: <input type="number" name="product_index" value={params.product_index} onChange={handleChange}/></label>
            <label>Risk Aversion (0-1): <input type="number" step="0.1" name="risk_aversion" value={params.risk_aversion} onChange={handleChange}/></label>
            <label>Holding Cost ($): <input type="number" step="0.01" name="holding_cost" value={params.holding_cost} onChange={handleChange}/></label>
            <label>Backorder Penalty ($): <input type="number" step="0.5" name="backorder_cost" value={params.backorder_cost} onChange={handleChange}/></label>
          </div>

          <h4 style={{ marginTop: '20px' }}>Regular Supplier (Supplier A)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
             <label>Cost ($): <input type="number" name="regular_unit_cost" value={params.regular_unit_cost} onChange={handleChange}/></label>
             <label>Lead Time (Days): <input type="number" name="regular_lead_time_mean" value={params.regular_lead_time_mean} onChange={handleChange}/></label>
             <label>Uncertainty (Std Dev): <input type="number" step="0.5" name="regular_lead_time_std" value={params.regular_lead_time_std} onChange={handleChange}/></label>
          </div>

          <h4 style={{ marginTop: '20px' }}>Emergency Supplier (Supplier B)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
             <label>Cost ($): <input type="number" name="emergency_unit_cost" value={params.emergency_unit_cost} onChange={handleChange}/></label>
             <label>Lead Time (Days): <input type="number" name="emergency_lead_time_mean" value={params.emergency_lead_time_mean} onChange={handleChange}/></label>
             <label>Uncertainty (Std Dev): <input type="number" step="0.5" name="emergency_lead_time_std" value={params.emergency_lead_time_std} onChange={handleChange}/></label>
          </div>

          <button 
            onClick={runSimulation} 
            disabled={loading}
            style={{ marginTop: '30px', padding: '10px 20px', fontSize: '16px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            {loading ? 'Running AI Engine...' : 'Run Risk-Aware Simulation'}
          </button>
          
          {error && <p style={{ color: 'red', marginTop: '20px' }}><strong>Error:</strong> {error}</p>}
        </div>

        {/* Results Panel */}
        <div style={{ flex: '1', border: '1px solid #ccc', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h3>Recommendation Results</h3>
          
          {!results && !loading && <p>Adjust parameters and click Run to see the AI recommendation.</p>}
          {loading && <p>Simulating hundreds of future scenarios...</p>}
          
          {results && !loading && (
            <div>
              <div style={{ padding: '15px', backgroundColor: '#e7f3fe', borderLeft: '6px solid #2196F3', marginBottom: '20px' }}>
                <h2 style={{ margin: '0 0 10px 0' }}>
                  Optimal Split: {Math.round(results.best_plan.primary_ratio * 100)}% Regular / {Math.round((1 - results.best_plan.primary_ratio) * 100)}% Emergency
                </h2>
                <p><strong>Expected Cost:</strong> ${results.best_plan.expected_cost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                <p><strong>Risk (CVaR):</strong> ${results.best_plan.cvar.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                <p><strong>Service Level:</strong> {(results.best_plan.expected_fill_rate * 100).toFixed(2)}%</p>
              </div>

              <h4>Why was this selected?</h4>
              <p style={{ fontStyle: 'italic', color: '#555' }}>
                {results.best_plan.primary_ratio === 1.0 
                  ? "Recommendation: Use exclusively the Regular Supplier. The cost savings outweigh the potential risk of lead-time delays, and service levels remain above the required threshold."
                  : results.best_plan.primary_ratio === 0.0
                  ? "Recommendation: Use exclusively the Emergency Supplier. The risk of delays from the Regular Supplier is too high to maintain service levels, justifying the premium cost."
                  : `Recommendation: Diversify sourcing. Allocating ${Math.round((1-results.best_plan.primary_ratio)*100)}% to the Emergency Supplier acts as an insurance policy. It slightly increases expected costs but significantly reduces the worst-case scenario risk (CVaR) caused by the Regular Supplier's lead-time uncertainty.`
                }
              </p>
              
              <details style={{ marginTop: '20px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>View Product Details</summary>
                <pre style={{ fontSize: '12px', marginTop: '10px' }}>{JSON.stringify(results.product_info, null, 2)}</pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
