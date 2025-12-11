import api from './api';
import Config from '../constants/Config';

// Helper for Images
const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/400x300.png?text=No+Image';
  if (imagePath.startsWith('http')) return imagePath;
  const cleanPath = imagePath.replace(/\\/g, '/');
  return `${Config.API_URL.replace('/api', '')}/${cleanPath}`;
};

// 1. PUBLIC: Search/List Cars (GET /)
export const getAllCars = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/cars?${params}`);
  return response.data; 
};

// 2. PUBLIC: Get Single Car (GET /:id)
export const getCarById = async (id) => {
  const response = await api.get(`/cars/${id}`);
  return response.data;
};

// 3. HOST: Get My Listings (GET /me)
export const getMyCars = async () => {
  const response = await api.get('/cars/me');
  return response.data;
};

// 4. HOST: Create New Car (POST /)
export const createCar = async (carData) => {
  const response = await api.post('/cars', carData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// 5. HOST: Update Car (PATCH /:id) -> NEW!
export const updateCar = async (id, carData) => {
  // If sending text only, axios handles JSON automatically.
  // If you decide to support image updates later, switch to FormData.
  const response = await api.patch(`/cars/${id}`, carData);
  return response.data;
};

// 6. HOST: Delete Car (DELETE /:id) -> NEW!
export const deleteCar = async (id) => {
  const response = await api.delete(`/cars/${id}`);
  return response.data;
};

export default {
  getAllCars,
  getCarById,
  getMyCars,
  createCar,
  updateCar,
  deleteCar,
  getImageUrl
};