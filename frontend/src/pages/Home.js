import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStats, getMarketPrices } from '../api';
import './Home.css';

const SPECIES_EMOJI = {
  cattle:  '\uD83D\uDC04',
  goat:    '\uD83D\uDC10',
  sheep:   '\uD83D\uDC11',
  camel:   '\uD83D\uDC2A',
  donkey:  '\uD83E\uDECF',
  pig:     '\uD83D\uDC37',
  poultry: '\uD83D\uDC13'
};

export default function Home() {
  const [stats, setStats]   = useState(null);
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    getStats().then(r => setStats(r.data.data)).catch(() => {});
    getMarketPrices().then(r => setPrices(r.data.data)).catch(() => {});
  }, []);

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-pattern" />
        </div>
        <div className="container hero-content">
          <div className="hero-tag">Ghana's Pastoral Marketplace</div>
          <h1 className="hero-title">
            Connect Farmers.<br />
            <span className="accent">Grow Markets.</span>
          </h1>
          <p className="hero-subtitle">
            PastoralLink helps pastoral farmers across Ghana list, manage, and sell
            livestock directly — no middlemen, fair prices, real connections.
          </p>
          <div className="hero-actions">
            <Link to="/market" className="btn btn-primary hero-btn">Browse Livestock</Link>
            <Link to="/add" className="btn btn-secondary hero-btn">List Your Animals</Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      {stats && (
        <section className="stats-section">
          <div className="container">
            <div className="stats-grid">
              {[
                { label: 'Active Listings',    value: stats.totalListings },
                { label: 'Registered Farmers', value: stats.totalFarmers },
                { label: 'Animals Sold',        value: stats.totalSold },
                { label: 'Open Inquiries',      value: stats.pendingInquiries },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <span className="stat-value">{s.value}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SPECIES */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Browse by Animal</h2>
          <div className="species-grid">
            {['cattle','goat','sheep','poultry','camel','pig'].map(s => (
              <Link key={s} to={`/market?species=${s}`} className="species-chip">
                <span className="species-chip-icon">{SPECIES_EMOJI[s]}</span>
                <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* MARKET PRICES */}
      {prices.length > 0 && (
        <section className="section prices-section">
          <div className="container">
            <h2 className="section-title">Current Market Prices</h2>
            <p className="section-sub">Average prices across regions (GHS)</p>
            <div className="prices-grid">
              {prices.slice(0, 6).map(p => (
                <div key={p.id} className="price-row">
                  <span>{SPECIES_EMOJI[p.species]} {p.species.charAt(0).toUpperCase() + p.species.slice(1)}</span>
                  <span className="price-region">{p.region}</span>
                  <span className="price-val">GHS {p.avg_price.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section className="section how-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            {[
              { step: '01', title: 'Register',      desc: 'Create your farmer profile with your name, phone, and region.' },
              { step: '02', title: 'List Animals',  desc: 'Add your livestock with details like species, age, weight, and price.' },
              { step: '03', title: 'Get Inquiries', desc: 'Buyers browse the marketplace and send you direct inquiries.' },
              { step: '04', title: 'Sell',          desc: 'Agree on a price, mark as sold, and receive your payment.' },
            ].map(s => (
              <div key={s.step} className="step-card">
                <div className="step-number">{s.step}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
