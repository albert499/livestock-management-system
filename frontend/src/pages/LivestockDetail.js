import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLivestockById, submitInquiry } from '../api';
import './LivestockDetail.css';

const SPECIES_EMOJI = {
  cattle:  '\uD83D\uDC04',
  goat:    '\uD83D\uDC10',
  sheep:   '\uD83D\uDC11',
  camel:   '\uD83D\uDC2A',
  donkey:  '\uD83E\uDECF',
  pig:     '\uD83D\uDC37',
  poultry: '\uD83D\uDC13'
};

import cattleImg  from '../assets/cattle.jpeg';
import goatImg    from '../assets/goats.jpeg';
import sheepImg   from '../assets/sheep.jpeg';
import poultryImg from '../assets/poultry.jpeg';

const SPECIES_IMAGE = {
  cattle:  cattleImg,
  goat:    goatImg,
  sheep:   sheepImg,
  poultry: poultryImg,
  camel:   cattleImg,
  donkey:  cattleImg,
  pig:     cattleImg,
};

export default function LivestockDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [item, setItem]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm]       = useState({ buyer_name: '', buyer_phone: '', message: '' });

  useEffect(() => {
    getLivestockById(id)
      .then(r => setItem(r.data.data))
      .catch(() => setError('Listing not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleInquiry = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await submitInquiry({ livestock_id: id, ...form });
      setSent(true);
    } catch {
      setError('Failed to send inquiry. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="page-loader">Loading...</div>;

  if (!item) return (
    <div className="detail-page">
      <div className="container">
        <div className="empty-state">
          <h3>Not Found</h3>
          <p>{error}</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/market')}>
            Back to Marketplace
          </button>
        </div>
      </div>
    </div>
  );

  const emoji = SPECIES_EMOJI[item.species] || '\uD83D\uDC3E';
  const age   = item.age_months >= 12
    ? `${Math.floor(item.age_months / 12)} yr${item.age_months % 12 ? ` ${item.age_months % 12} mo` : ''}`
    : `${item.age_months} months`;

  return (
    <div className="detail-page">
      <div className="container detail-body">
        <button className="btn btn-ghost back-btn" onClick={() => navigate(-1)}>Back</button>

        <div className="detail-grid">
          <div className="detail-main">
            <div className="detail-hero">
              <div className="detail-image-wrap">
                <img
                  src={SPECIES_IMAGE[item.species] || SPECIES_IMAGE.cattle}
                  alt={item.species}
                  className="detail-image"
                />
                <span className="detail-emoji-overlay">{emoji}</span>
              </div>
              <div className="detail-badges">
                <span className={`badge badge-${item.status}`}>{item.status}</span>
                {item.quantity > 1 && (
                  <span className="badge" style={{ background: '#EDE7F6', color: '#4A148C' }}>
                    x{item.quantity} available
                  </span>
                )}
              </div>
            </div>

            <div className="detail-info">
              <h1 className="detail-title">
                {item.breed || item.species.charAt(0).toUpperCase() + item.species.slice(1)}
              </h1>
              <p className="detail-species">{item.species}</p>

              <div className="detail-price">
                <span className="dp-label">GHS</span>
                <span className="dp-amount">{item.price_ghs.toLocaleString()}</span>
                {item.quantity > 1 && <span className="dp-per">per animal</span>}
              </div>

              <div className="detail-attrs">
                {[
                  { label: 'Age',      value: age },
                  { label: 'Weight',   value: item.weight_kg ? `${item.weight_kg} kg` : 'Not specified' },
                  { label: 'Quantity', value: item.quantity },
                  { label: 'Location', value: `${item.location}, ${item.region}` },
                  { label: 'Species',  value: item.species },
                  { label: 'Breed',    value: item.breed || 'Not specified' },
                ].map(a => (
                  <div key={a.label} className="attr-row">
                    <span className="attr-label">{a.label}</span>
                    <span className="attr-value">{a.value}</span>
                  </div>
                ))}
              </div>

              {item.description && (
                <div className="detail-desc">
                  <h3>Description</h3>
                  <p>{item.description}</p>
                </div>
              )}

              <div className="farmer-card">
                <h3>Seller Information</h3>
                <p><strong>{item.farmer_name}</strong></p>
                <p>Location: {item.location}, {item.farmer_region || item.region}</p>
                <p>Phone: {item.farmer_phone}</p>
              </div>
            </div>
          </div>

          <aside className="detail-sidebar">
            <div className="inquiry-card">
              <h2>Contact Seller</h2>
              <p className="inquiry-sub">Send a message to {item.farmer_name} about this listing</p>

              {sent ? (
                <div className="inquiry-success">
                  <h3>Inquiry Sent!</h3>
                  <p>The farmer will contact you on your phone number shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleInquiry} className="inquiry-form">
                  {error && <div className="alert-error">{error}</div>}

                  <div className="form-group">
                    <label>Your Name *</label>
                    <input name="buyer_name" className="form-control" placeholder="e.g. Kwame Asante" value={form.buyer_name} onChange={handleChange} required />
                  </div>

                  <div className="form-group">
                    <label>Your Phone *</label>
                    <input name="buyer_phone" className="form-control" placeholder="e.g. 0244567890" value={form.buyer_phone} onChange={handleChange} required />
                  </div>

                  <div className="form-group">
                    <label>Message</label>
                    <textarea name="message" className="form-control" rows="4" placeholder="I am interested in this animal. Is the price negotiable?" value={form.message} onChange={handleChange} />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={sending}>
                    {sending ? 'Sending...' : 'Send Inquiry'}
                  </button>
                </form>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}