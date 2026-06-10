import React from 'react';
import { Link } from 'react-router-dom';
import './LivestockCard.css';

const SPECIES_EMOJI = {
  cattle:  '\uD83D\uDC04',
  goat:    '\uD83D\uDC10',
  sheep:   '\uD83D\uDC11',
  camel:   '\uD83D\uDC2A',
  donkey:  '\uD83E\uDECF',
  pig:     '\uD83D\uDC37',
  poultry: '\uD83D\uDC13'
};

export default function LivestockCard({ item, onDelete }) {
  const emoji = SPECIES_EMOJI[item.species] || '\uD83D\uDC3E';
  const age = item.age_months >= 12
    ? `${Math.floor(item.age_months / 12)}yr ${item.age_months % 12 ? item.age_months % 12 + 'mo' : ''}`
    : `${item.age_months}mo`;

  return (
    <div className="livestock-card card">
      <div className="card-header">
        <span className="species-emoji">{emoji}</span>
        <div className="card-badges">
          <span className={`badge badge-${item.status}`}>{item.status}</span>
          {item.quantity > 1 && (
            <span className="badge" style={{ background: '#EDE7F6', color: '#4A148C' }}>
              x{item.quantity}
            </span>
          )}
        </div>
      </div>

      <div className="card-body">
        <h3 className="card-title">
          {item.breed ? item.breed : item.species.charAt(0).toUpperCase() + item.species.slice(1)}
        </h3>
        <p className="card-sub">
          {item.species.charAt(0).toUpperCase() + item.species.slice(1)} · {age}
          {item.weight_kg ? ` · ${item.weight_kg}kg` : ''}
        </p>

        <div className="card-meta">
          <span className="meta-item">{item.location}, {item.region}</span>
          {item.farmer_name && <span className="meta-item">Seller: {item.farmer_name}</span>}
        </div>

        {item.description && <p className="card-desc">{item.description}</p>}
      </div>

      <div className="card-footer">
        <div className="price">
          <span className="price-label">GHS</span>
          <span className="price-amount">{item.price_ghs.toLocaleString()}</span>
        </div>
        <div className="card-actions">
          <Link to={`/livestock/${item.id}`} className="btn btn-primary btn-sm">View</Link>
          {onDelete && (
            <button onClick={() => onDelete(item.id)} className="btn btn-ghost btn-sm delete-btn">Delete</button>
          )}
        </div>
      </div>
    </div>
  );
}
