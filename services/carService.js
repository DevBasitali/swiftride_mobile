// services/carService.js
import api from './api';
import Config from '../constants/Config';

// ============================================
// 🎨 CONSTANTS
// ============================================

export const TRANSMISSION_TYPES = {
  AUTOMATIC: 'Automatic',
  MANUAL: 'Manual',
};

export const FUEL_TYPES = {
  PETROL: 'Petrol',
  DIESEL: 'Diesel',
  HYBRID: 'Hybrid',
  ELECTRIC: 'Electric',
  OTHER: 'Other',
};

export const OWNER_ROLE = 'host';

export const DAYS_OF_WEEK = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
];

export const CURRENT_YEAR = new Date().getFullYear();
export const MIN_YEAR = 1950;
export const MAX_YEAR = CURRENT_YEAR + 1;

export const VALIDATION = {
  MIN_SEATS: 1,
  MAX_SEATS: 100,
  MIN_PRICE: 0,
  MAX_PHOTOS: 10,
  MAX_CARS_PER_USER: 20,
};

// ============================================
// 🖼️ IMAGE HELPER
// ============================================

export const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/400x300.png?text=No+Image';
  
  if (imagePath.startsWith('http')) return imagePath;

  let cleanPath = imagePath.replace(/\\/g, '/');
  if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);

  const baseUrl = Config.API_URL.replace(/\/api\/?$/, '');
  return `${baseUrl}/${cleanPath}`;
};

// ============================================
// 🌐 API CALLS
// ============================================

/**
 * 1. PUBLIC: Search/List Cars
 */
export const searchCars = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.brand) params.append('brand', filters.brand);
    if (filters.model) params.append('model', filters.model);
    if (filters.location) params.append('location', filters.location);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.minYear) params.append('minYear', filters.minYear);
    if (filters.maxYear) params.append('maxYear', filters.maxYear);

    const response = await api.get(`/cars?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * 2. PUBLIC: Get All Cars
 */
export const getAllCars = async (filters = {}) => {
  return searchCars(filters);
};

/**
 * 3. PUBLIC: Get Single Car Details
 */
export const getCarById = async (carId) => {
  try {
    const response = await api.get(`/cars/${carId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * 4. HOST: Get My Cars
 */
export const getMyCars = async () => {
  try {
    const response = await api.get('/cars/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * 5. HOST: Create New Car
 */
export const createCar = async (formData) => {
  try {
    const response = await api.post('/cars', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Create Car Error:', error);
    throw error;
  }
};

/**
 * 6. HOST: Update Car
 */
export const updateCar = async (carId, carData) => {
  try {
    const updatePayload = {
      make: carData.make,
      model: carData.model,
      year: carData.year,
      color: carData.color,
      plateNumber: carData.plateNumber,
      pricePerHour: carData.pricePerHour,
      pricePerDay: carData.pricePerDay,
      seats: carData.seats,
      transmission: carData.transmission,
      fuelType: carData.fuelType,
      location: carData.location,
      availability: carData.availability,
      features: carData.features,
      isActive: carData.isActive,
    };

    Object.keys(updatePayload).forEach(key => {
      if (updatePayload[key] === undefined) {
        delete updatePayload[key];
      }
    });

    const response = await api.patch(`/cars/${carId}`, updatePayload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * 7. HOST: Delete Car
 */
export const deleteCar = async (carId) => {
  try {
    const response = await api.delete(`/cars/${carId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * 8. HOST: Toggle Car Active Status
 */
export const toggleCarStatus = async (carId, isActive) => {
  try {
    const response = await api.patch(`/cars/${carId}`, { isActive });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============================================
// 🔧 UTILITY FUNCTIONS
// ============================================

export const calculatePrice = (pricePerDay, pricePerHour, days, hours) => {
  const dayPrice = days * pricePerDay;
  const hourPrice = hours * pricePerHour;
  return dayPrice + hourPrice;
};

export const formatCarName = (car) => {
  if (!car) return '';
  return `${car.year} ${car.make} ${car.model}`;
};

export const getTransmissionIcon = (transmission) => {
  return transmission === TRANSMISSION_TYPES.AUTOMATIC ? 'car-shift-pattern' : 'car-clutch';
};

export const getFuelTypeIcon = (fuelType) => {
  const icons = {
    [FUEL_TYPES.PETROL]: 'gas-station',
    [FUEL_TYPES.DIESEL]: 'gas-station',
    [FUEL_TYPES.HYBRID]: 'leaf',
    [FUEL_TYPES.ELECTRIC]: 'flash',
    [FUEL_TYPES.OTHER]: 'help-circle',
  };
  return icons[fuelType] || 'gas-station';
};

export const createEmptyCarData = () => ({
  make: '',
  model: '',
  year: CURRENT_YEAR,
  color: '',
  plateNumber: '',
  pricePerHour: 0,
  pricePerDay: 0,
  seats: 5,
  transmission: TRANSMISSION_TYPES.AUTOMATIC,
  fuelType: FUEL_TYPES.PETROL,
  location: {
    address: '',
    lat: undefined,
    lng: undefined,
  },
  availability: {
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    startTime: '00:00',
    endTime: '23:59',
    isAvailable: true,
  },
  features: [],
  isActive: true,
});

// ============================================
// 📤 DEFAULT EXPORT
// ============================================

export default {
  searchCars,
  getAllCars,
  getCarById,
  getMyCars,
  createCar,
  updateCar,
  deleteCar,
  toggleCarStatus,
  getImageUrl,
  calculatePrice,
  formatCarName,
  getTransmissionIcon,
  getFuelTypeIcon,
  createEmptyCarData,
  TRANSMISSION_TYPES,
  FUEL_TYPES,
  OWNER_ROLE,
  DAYS_OF_WEEK,
  VALIDATION,
  CURRENT_YEAR,
  MIN_YEAR,
  MAX_YEAR,
};