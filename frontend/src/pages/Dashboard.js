import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getStats, getLivestock, deleteLivestock, updateLivestock } from '../api';
import LivestockCard from '../components/LivestockCard';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats]         = useState(null);
  const [listings, setListings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('available');

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([
      getStats(),
      getLivestock({ status: activeTab }),
    ]).then(([s, l]) => {
      setStats(s.data.data);
      setListings(l.data.data);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, [activeTab]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    await deleteLivestock(id);
    setListings(prev => prev.filter(l => l.id !== id));
  };

  const handleMarkSold = async (id) => {
    await updateLivestock(id, { status: 'sold' });
    setListings(prev => prev.filter(l => l.id !== id));
  };

  const SPECIES_COLORS = {
    cattle: '#8B4513', goat: '#4A7C59', sheep: '#E8A020',
    poultry: '#C1440E', camel: '#2E6E9E', pig: '#7B3F9E', donkey: '#5C3D2E'
  };

  return (
    <div className="dashboard">
      <div className="dash-header">
        <div className="container dash-header-inner">
          <div>
            <h1>Dashboard</h1>
            <p>Manage your livestock listings</p>
          </div>
          <Link to="/add" className="btn btn-primary">+ New Listing</Link>
        </div>
      </div>

      <div className="container dash-body">
        {stats && (
          <div className="dash-stats">
            {[
              { label: 'Active Listings',    value: stats.totalListings,    color: '#4A7C59' },
              { label: 'Registered Farmers', value: stats.totalFarmers,     color: '#8B4513' },
              { label: 'Sold',               value: stats.totalSold,        color: '#2E6E9E' },
              { label: 'Pending Inquiries',  value: stats.pendingInquiries, color: '#C1440E' },
            ].map(s => (
              <div key={s.label} className="dash-stat" style={{ borderTopColor: s.color }}>
                <span className="ds-val">{s.value}</span>
                <span className="ds-label">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {stats?.bySpecies?.length > 0 && (
          <div className="breakdown-section">
            <h2 className="section-title">Listings by Species</h2>
            <div className="species-breakdown">
              {stats.bySpecies.map(s => (
                <div key={s.species} className="species-bar-item">
                  <div className="sbi-label">
                    <span>{s.species}</span>
                    <span className="sbi-count">{s.count}</span>
                  </div>
                  <div className="sbi-bar-bg">
                    <div
                      className="sbi-bar-fill"
                      style={{
                        width: `${(s.count / Math.max(...stats.bySpecies.map(x => x.count))) * 100}%`,
                        background: SPECIES_COLORS[s.species] || '#999'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="listings-section">
          <div className="listings-tabs">
            {['available', 'reserved', 'sold'].map(tab => (
              <button
                key={tab}
                className={`listing-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="page-loader">Loading...</div>
          ) : listings.length === 0 ? (
            <div className="empty-state">
              <h3>No {activeTab} listings</h3>
              <p>{activeTab === 'available' ? 'Start by adding your first listing.' : 'Nothing here yet.'}</p>
              {activeTab === 'available' && (
                <Link to="/add" className="btn btn-primary" style={{ marginTop: 16 }}>Add Listing</Link>
              )}
            </div>
          ) : (
            <div className="dash-listings-grid">
              {listings.map(item => (
                <div key={item.id} className="dash-card-wrap">
                  <LivestockCard item={item} onDelete={handleDelete} />
                  {activeTab === 'available' && (
                    <button className="mark-sold-btn" onClick={() => handleMarkSold(item.id)}>
                      Mark as Sold
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
