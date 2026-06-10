import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

export const getLivestock    = (params) => API.get('/livestock', { params });
export const getLivestockById = (id)    => API.get(`/livestock/${id}`);
export const createLivestock = (data)   => API.post('/livestock', data);
export const updateLivestock = (id, data) => API.patch(`/livestock/${id}`, data);
export const deleteLivestock = (id)     => API.delete(`/livestock/${id}`);

export const getFarmers      = ()       => API.get('/farmers');
export const getFarmerById   = (id)     => API.get(`/farmers/${id}`);
export const createFarmer    = (data)   => API.post('/farmers', data);

export const submitInquiry   = (data)   => API.post('/inquiries', data);
export const getStats        = ()       => API.get('/stats');
export const getMarketPrices = ()       => API.get('/market-prices');
