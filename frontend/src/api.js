import axios from 'axios';

const API = axios.create({ baseURL: 'https://livestock-management-system-ors5.onrender.com/api' });

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

// Health Records
export const getHealthRecords     = (livestockId) => API.get(`/health-records/${livestockId}`);
export const getAllHealthRecords   = (params)      => API.get('/health-records', { params });
export const createHealthRecord   = (data)        => API.post('/health-records', data);
export const deleteHealthRecord   = (id)          => API.delete(`/health-records/${id}`);

// Productivity Records
export const getProductivityRecords   = (livestockId) => API.get(`/productivity-records/${livestockId}`);
export const getAllProductivityRecords = ()            => API.get('/productivity-records');
export const createProductivityRecord = (data)        => API.post('/productivity-records', data);
export const deleteProductivityRecord = (id)          => API.delete(`/productivity-records/${id}`);
