import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getLivestock } from '../api';
import LivestockCard from '../components/LivestockCard';
import './Marketplace.css';

const REGIONS = ['All Regions','Northern','Upper East','Upper West','Ashanti','Greater Accra','Volta','Eastern','Western','Central','Brong-Ahafo'];
const SPECIES  = ['All Species','cattle','goat','sheep','poultry','camel','donkey','pig'];

export default function Marketplace() {
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({
    species:   searchParams.get('species') || '',
    region:    '',
    min_price: '',
    max_price: '',
  });

  const fetchListings = useCallback(() => {
    setLoading(true);
    const params = {};
    if (filters.species)   params.species   = filters.species;
    if (filters.region)    params.region    = filters.region;
    if (filters.min_price) params.min_price = filters.min_price;
    if (filters.max_price) params.max_price = filters.max_price;

    getLivestock(params)
      .then(r => setListings(r.data.data))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handleFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));
  const clearFilters = () => setFilters({ species: '', region: '', min_price: '', max_price: '' });
  const activeCount  = Object.values(filters).filter(Boolean).length;

  return (
    <div className="marketplace">
      <div className="market-header">
        <div className="container">
          <h1>Livestock Marketplace</h1>
          <p>Find quality animals from pastoral farmers across Ghana</p>
        </div>
      </div>

      <div className="container market-body">
        <aside className="filters-panel">
          <div className="filters-head">
            <h3>Filters {activeCount > 0 && <span className="filter-count">{activeCount}</span>}</h3>
            {activeCount > 0 && <button className="btn btn-ghost clear-btn" onClick={clearFilters}>Clear all</button>}
          </div>

          <div className="filter-group">
            <label>Animal Type</label>
            <select
              className="form-control"
              value={filters.species}
              onChange={e => handleFilter('species', e.target.value === 'All Species' ? '' : e.target.value)}
            >
              {SPECIES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>Region</label>
            <select
              className="form-control"
              value={filters.region}
              onChange={e => handleFilter('region', e.target.value === 'All Regions' ? '' : e.target.value)}
            >
              {REGIONS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>Price Range (GHS)</label>
            <div className="price-range">
              <input className="form-control" type="number" placeholder="Min" value={filters.min_price} onChange={e => handleFilter('min_price', e.target.value)} />
              <span>–</span>
              <input className="form-control" type="number" placeholder="Max" value={filters.max_price} onChange={e => handleFilter('max_price', e.target.value)} />
            </div>
          </div>
        </aside>

        <main className="listings-area">
          <div className="listings-meta">
            <span>{listings.length} listing{listings.length !== 1 ? 's' : ''} found</span>
          </div>

          {loading ? (
            <div className="page-loader">🐄</div>
          ) : listings.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🔍</div>
              <h3>No listings found</h3>
              <p>Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <div className="listings-grid">
              {listings.map(item => <LivestockCard key={item.id} item={item} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
