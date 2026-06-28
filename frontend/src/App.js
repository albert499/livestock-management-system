import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import AddListing from './pages/AddListing';
import Dashboard from './pages/Dashboard';
import LivestockDetail from './pages/LivestockDetail';
import HealthTracking from './pages/HealthTracking';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/market"    element={<Marketplace />} />
        <Route path="/add"       element={<AddListing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/health"    element={<HealthTracking />} />
        <Route path="/livestock/:id" element={<LivestockDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
