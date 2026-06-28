import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createLivestock, getFarmers, createFarmer } from '../api';
import './AddListing.css';

const SPECIES  = ['cattle','goat','sheep','poultry','camel','donkey','pig'];
const REGIONS  = ['Northern','Upper East','Upper West','Ashanti','Greater Accra','Volta','Eastern','Western','Central','Brong-Ahafo'];

export default function AddListing() {
  const navigate = useNavigate();
  const [farmers, setFarmers] = useState([]);
  const [step, setStep]       = useState('listing'); // 'listing' | 'new-farmer'
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    farmer_id: '', species: 'cattle', breed: '',
    age_months: '', weight_kg: '', price_ghs: '',
    quantity: 1, description: '', location: '', region: 'Northern',
  });

  const [farmerForm, setFarmerForm] = useState({
    name: '', phone: '', location: '', region: 'Northern'
  });

  useEffect(() => {
    getFarmers().then(r => {
      setFarmers(r.data.data);
      if (r.data.data.length > 0) setForm(f => ({ ...f, farmer_id: r.data.data[0].id }));
    }).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleFarmerChange = (e) => {
    const { name, value } = e.target;
    setFarmerForm(f => ({ ...f, [name]: value }));
  };

  const submitFarmer = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await createFarmer(farmerForm);
      const newFarmer = res.data.data;
      setFarmers(prev => [newFarmer, ...prev]);
      setForm(f => ({ ...f, farmer_id: newFarmer.id }));
      setStep('listing');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create farmer');
    } finally {
      setSubmitting(false);
    }
  };

  const submitListing = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createLivestock({
        ...form,
        age_months: Number(form.age_months),
        weight_kg:  form.weight_kg ? Number(form.weight_kg) : undefined,
        price_ghs:  Number(form.price_ghs),
        quantity:   Number(form.quantity),
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) return (
    <div className="add-page">
      <div className="container">
        <div className="success-state">
          <div className="success-icon">✅</div>
          <h2>Listing Created!</h2>
          <p>Redirecting to your dashboard…</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="add-page">
      <div className="add-header">
        <div className="container">
          <h1>List Your Animals</h1>
          <p>Add your livestock to the PastoralLink marketplace</p>
        </div>
      </div>

      <div className="container add-body">
        <div className="add-form-wrap">
          {/* Step tabs */}
          <div className="step-tabs">
            <button className={`step-tab ${step === 'listing' ? 'active' : ''}`} onClick={() => setStep('listing')}>
              🐄 Listing Details
            </button>
            <button className={`step-tab ${step === 'new-farmer' ? 'active' : ''}`} onClick={() => setStep('new-farmer')}>
              👤 New Farmer
            </button>
          </div>

          {error && <div className="alert-error">⚠️ {error}</div>}

          {/* ── LISTING FORM ── */}
          {step === 'listing' && (
            <form onSubmit={submitListing} className="add-form">
              <div className="form-group">
                <label>Farmer *</label>
                {farmers.length === 0 ? (
                  <p className="no-farmer-hint">No farmers registered yet. <button type="button" className="link-btn" onClick={() => setStep('new-farmer')}>Add one →</button></p>
                ) : (
                  <select name="farmer_id" className="form-control" value={form.farmer_id} onChange={handleChange} required>
                    {farmers.map(f => <option key={f.id} value={f.id}>{f.name} — {f.location}</option>)}
                  </select>
                )}
                <span className="form-hint">Not listed? <button type="button" className="link-btn" onClick={() => setStep('new-farmer')}>Register new farmer</button></span>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Animal Type *</label>
                  <select name="species" className="form-control" value={form.species} onChange={handleChange} required>
                    {SPECIES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Breed (optional)</label>
                  <input name="breed" className="form-control" placeholder="e.g. West African Shorthorn" value={form.breed} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Age (months) *</label>
                  <input name="age_months" type="number" min="1" className="form-control" placeholder="e.g. 24" value={form.age_months} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input name="weight_kg" type="number" min="1" className="form-control" placeholder="e.g. 120" value={form.weight_kg} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (GHS) *</label>
                  <input name="price_ghs" type="number" min="1" className="form-control" placeholder="e.g. 2500" value={form.price_ghs} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Quantity *</label>
                  <input name="quantity" type="number" min="1" className="form-control" value={form.quantity} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Location *</label>
                  <input name="location" className="form-control" placeholder="e.g. Tamale" value={form.location} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Region *</label>
                  <select name="region" className="form-control" value={form.region} onChange={handleChange} required>
                    {REGIONS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea name="description" className="form-control" rows="3" placeholder="Describe the animal's condition, vaccination status, etc." value={form.description} onChange={handleChange} />
              </div>

              <button type="submit" className="btn btn-primary submit-btn" disabled={submitting || !form.farmer_id}>
                {submitting ? '⏳ Submitting…' : '✅ Create Listing'}
              </button>
            </form>
          )}

          {/* ── NEW FARMER FORM ── */}
          {step === 'new-farmer' && (
            <form onSubmit={submitFarmer} className="add-form">
              <div className="form-group">
                <label>Full Name *</label>
                <input name="name" className="form-control" placeholder="e.g. Kofi Mensah" value={farmerForm.name} onChange={handleFarmerChange} required />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input name="phone" className="form-control" placeholder="e.g. 0244123456" value={farmerForm.phone} onChange={handleFarmerChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Location *</label>
                  <input name="location" className="form-control" placeholder="e.g. Bolgatanga" value={farmerForm.location} onChange={handleFarmerChange} required />
                </div>
                <div className="form-group">
                  <label>Region *</label>
                  <select name="region" className="form-control" value={farmerForm.region} onChange={handleFarmerChange} required>
                    {REGIONS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary submit-btn" disabled={submitting}>
                {submitting ? '⏳ Registering…' : '👤 Register Farmer'}
              </button>
            </form>
          )}
        </div>

        {/* Tips sidebar */}
        <aside className="add-tips">
          <h3>💡 Tips for a great listing</h3>
          <ul>
            <li>Include the breed name to attract serious buyers</li>
            <li>Mention vaccination and health status in the description</li>
            <li>Set a fair price based on current market rates</li>
            <li>Accurate weight info builds buyer trust</li>
            <li>Specify your exact town, not just region</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
