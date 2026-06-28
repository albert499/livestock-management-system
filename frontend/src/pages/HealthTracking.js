import React, { useEffect, useState, useCallback } from 'react';
import { getLivestock, getAllHealthRecords, createHealthRecord, deleteHealthRecord,
         getAllProductivityRecords, createProductivityRecord, deleteProductivityRecord } from '../api';
import './HealthTracking.css';

const CONDITIONS = ['healthy', 'sick', 'recovering', 'deceased'];
const CONDITION_COLORS = {
  healthy:    { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
  sick:       { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' },
  recovering: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  deceased:   { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' },
};

export default function HealthTracking() {
  const [activeTab, setActiveTab]         = useState('health');
  const [livestock, setLivestock]         = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [prodRecords, setProdRecords]     = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showForm, setShowForm]           = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState('');
  const [filterCondition, setFilterCondition] = useState('');

  const [healthForm, setHealthForm] = useState({
    livestock_id: '', record_date: new Date().toISOString().split('T')[0],
    condition: 'healthy', treatment: '', veterinarian: '', notes: '',
  });

  const [prodForm, setProdForm] = useState({
    livestock_id: '', record_date: new Date().toISOString().split('T')[0],
    weight_kg: '', milk_yield_l: '', offspring_count: '', notes: '',
  });

  const loadData = useCallback(() => {
    setLoading(true);
    const params = filterCondition ? { condition: filterCondition } : {};
    Promise.all([
      getLivestock({}),
      getAllHealthRecords(params),
      getAllProductivityRecords(),
    ]).then(([lv, hr, pr]) => {
      setLivestock(lv.data.data || []);
      setHealthRecords(hr.data.data || []);
      setProdRecords(pr.data.data || []);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, [filterCondition]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleHealthSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      await createHealthRecord(healthForm);
      setSuccess('Health record added successfully!');
      setShowForm(false);
      setHealthForm(f => ({ ...f, treatment: '', veterinarian: '', notes: '', condition: 'healthy' }));
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add record');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleProdSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      await createProductivityRecord({
        ...prodForm,
        weight_kg: prodForm.weight_kg ? Number(prodForm.weight_kg) : undefined,
        milk_yield_l: prodForm.milk_yield_l ? Number(prodForm.milk_yield_l) : undefined,
        offspring_count: prodForm.offspring_count ? Number(prodForm.offspring_count) : 0,
      });
      setSuccess('Productivity record added!');
      setShowForm(false);
      setProdForm(f => ({ ...f, weight_kg: '', milk_yield_l: '', offspring_count: '', notes: '' }));
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add record');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleDeleteHealth = async (id) => {
    if (!window.confirm('Delete this health record?')) return;
    await deleteHealthRecord(id);
    setHealthRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleDeleteProd = async (id) => {
    if (!window.confirm('Delete this productivity record?')) return;
    await deleteProductivityRecord(id);
    setProdRecords(prev => prev.filter(r => r.id !== id));
  };

  // Summary stats
  const healthSummary = CONDITIONS.reduce((acc, c) => {
    acc[c] = healthRecords.filter(r => r.condition === c).length;
    return acc;
  }, {});

  return (
    <div className="ht-page">
      <div className="ht-header">
        <div className="container ht-header-inner">
          <div>
            <h1>Health &amp; Productivity Tracking</h1>
            <p>Monitor animal health and track productivity metrics across your herd</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setShowForm(true); setError(''); }}>
            + Add Record
          </button>
        </div>
      </div>

      <div className="container ht-body">

        {/* Summary cards */}
        <div className="ht-summary">
          {CONDITIONS.map(c => {
            const col = CONDITION_COLORS[c];
            return (
              <div key={c} className="ht-stat-card"
                style={{ background: col.bg, borderColor: col.border, color: col.text }}
                onClick={() => setFilterCondition(filterCondition === c ? '' : c)}
              >
                <span className="ht-stat-val">{healthSummary[c] || 0}</span>
                <span className="ht-stat-label">{c.charAt(0).toUpperCase() + c.slice(1)}</span>
                {filterCondition === c && <span className="ht-filter-active">● filtering</span>}
              </div>
            );
          })}
          <div className="ht-stat-card" style={{ background: '#EFF6FF', borderColor: '#93C5FD', color: '#1D4ED8' }}>
            <span className="ht-stat-val">{prodRecords.length}</span>
            <span className="ht-stat-label">Productivity Logs</span>
          </div>
        </div>

        {success && <div className="alert-success">✅ {success}</div>}

        {/* Tabs */}
        <div className="ht-tabs">
          {['health', 'productivity'].map(tab => (
            <button key={tab} className={`ht-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}>
              {tab === 'health' ? '🩺 Health Records' : '📊 Productivity Records'}
            </button>
          ))}
        </div>

        {/* ADD RECORD MODAL */}
        {showForm && (
          <div className="ht-modal-overlay" onClick={() => setShowForm(false)}>
            <div className="ht-modal" onClick={e => e.stopPropagation()}>
              <div className="ht-modal-header">
                <h2>{activeTab === 'health' ? 'Add Health Record' : 'Add Productivity Record'}</h2>
                <button className="ht-close" onClick={() => setShowForm(false)}>✕</button>
              </div>

              {error && <div className="alert-error">⚠️ {error}</div>}

              {activeTab === 'health' ? (
                <form onSubmit={handleHealthSubmit} className="ht-form">
                  <div className="form-group">
                    <label>Animal *</label>
                    <select className="form-control" value={healthForm.livestock_id}
                      onChange={e => setHealthForm(f => ({ ...f, livestock_id: e.target.value }))} required>
                      <option value="">— Select animal —</option>
                      {livestock.map(l => (
                        <option key={l.id} value={l.id}>
                          {l.breed || l.species} — {l.farmer_name} ({l.location})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date *</label>
                      <input type="date" className="form-control" value={healthForm.record_date}
                        onChange={e => setHealthForm(f => ({ ...f, record_date: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label>Condition *</label>
                      <select className="form-control" value={healthForm.condition}
                        onChange={e => setHealthForm(f => ({ ...f, condition: e.target.value }))} required>
                        {CONDITIONS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Treatment / Intervention</label>
                    <input className="form-control" placeholder="e.g. FMD Vaccine, Deworming" value={healthForm.treatment}
                      onChange={e => setHealthForm(f => ({ ...f, treatment: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Veterinarian</label>
                    <input className="form-control" placeholder="e.g. Dr. Mensah" value={healthForm.veterinarian}
                      onChange={e => setHealthForm(f => ({ ...f, veterinarian: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Notes</label>
                    <textarea className="form-control" rows="3" placeholder="Any additional observations..."
                      value={healthForm.notes} onChange={e => setHealthForm(f => ({ ...f, notes: e.target.value }))} />
                  </div>
                  <button type="submit" className="btn btn-primary submit-btn" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Health Record'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleProdSubmit} className="ht-form">
                  <div className="form-group">
                    <label>Animal *</label>
                    <select className="form-control" value={prodForm.livestock_id}
                      onChange={e => setProdForm(f => ({ ...f, livestock_id: e.target.value }))} required>
                      <option value="">— Select animal —</option>
                      {livestock.map(l => (
                        <option key={l.id} value={l.id}>
                          {l.breed || l.species} — {l.farmer_name} ({l.location})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date *</label>
                    <input type="date" className="form-control" value={prodForm.record_date}
                      onChange={e => setProdForm(f => ({ ...f, record_date: e.target.value }))} required />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Weight (kg)</label>
                      <input type="number" step="0.1" min="0" className="form-control" placeholder="e.g. 280"
                        value={prodForm.weight_kg} onChange={e => setProdForm(f => ({ ...f, weight_kg: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Milk Yield (litres/day)</label>
                      <input type="number" step="0.1" min="0" className="form-control" placeholder="e.g. 1.5"
                        value={prodForm.milk_yield_l} onChange={e => setProdForm(f => ({ ...f, milk_yield_l: e.target.value }))} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Offspring Count</label>
                    <input type="number" min="0" className="form-control" placeholder="0"
                      value={prodForm.offspring_count} onChange={e => setProdForm(f => ({ ...f, offspring_count: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Notes</label>
                    <textarea className="form-control" rows="3" placeholder="Growth observations, milking notes..."
                      value={prodForm.notes} onChange={e => setProdForm(f => ({ ...f, notes: e.target.value }))} />
                  </div>
                  <button type="submit" className="btn btn-primary submit-btn" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Productivity Record'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* RECORDS TABLE */}
        {loading ? (
          <div className="page-loader">Loading records...</div>
        ) : activeTab === 'health' ? (
          <>
            {filterCondition && (
              <div className="filter-banner">
                Showing: <strong>{filterCondition}</strong> animals
                <button className="btn btn-ghost" style={{ marginLeft: 12 }} onClick={() => setFilterCondition('')}>Clear filter</button>
              </div>
            )}
            {healthRecords.length === 0 ? (
              <div className="empty-state">
                <div className="icon">🩺</div>
                <h3>No health records yet</h3>
                <p>Start tracking animal health by adding your first record.</p>
              </div>
            ) : (
              <div className="ht-table-wrap">
                <table className="ht-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Animal</th>
                      <th>Farmer</th>
                      <th>Location</th>
                      <th>Condition</th>
                      <th>Treatment</th>
                      <th>Vet</th>
                      <th>Notes</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {healthRecords.map(r => {
                      const col = CONDITION_COLORS[r.condition];
                      return (
                        <tr key={r.id}>
                          <td>{r.record_date}</td>
                          <td><strong>{r.breed || r.species}</strong></td>
                          <td>{r.farmer_name}</td>
                          <td>{r.location}</td>
                          <td>
                            <span className="condition-badge"
                              style={{ background: col.bg, color: col.text, border: `1px solid ${col.border}` }}>
                              {r.condition}
                            </span>
                          </td>
                          <td>{r.treatment || '—'}</td>
                          <td>{r.veterinarian || '—'}</td>
                          <td className="notes-cell">{r.notes || '—'}</td>
                          <td>
                            <button className="delete-btn" onClick={() => handleDeleteHealth(r.id)} title="Delete">✕</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <>
            {prodRecords.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📊</div>
                <h3>No productivity records yet</h3>
                <p>Track weight, milk yield, and offspring data for your livestock.</p>
              </div>
            ) : (
              <div className="ht-table-wrap">
                <table className="ht-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Animal</th>
                      <th>Farmer</th>
                      <th>Location</th>
                      <th>Weight (kg)</th>
                      <th>Milk Yield (L)</th>
                      <th>Offspring</th>
                      <th>Notes</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {prodRecords.map(r => (
                      <tr key={r.id}>
                        <td>{r.record_date}</td>
                        <td><strong>{r.breed || r.species}</strong></td>
                        <td>{r.farmer_name}</td>
                        <td>{r.location}</td>
                        <td>{r.weight_kg != null ? `${r.weight_kg} kg` : '—'}</td>
                        <td>{r.milk_yield_l != null ? `${r.milk_yield_l} L` : '—'}</td>
                        <td>{r.offspring_count > 0 ? r.offspring_count : '—'}</td>
                        <td className="notes-cell">{r.notes || '—'}</td>
                        <td>
                          <button className="delete-btn" onClick={() => handleDeleteProd(r.id)} title="Delete">✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
