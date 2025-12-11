import api from './api';

const kycService = {
  // Submit KYC for Customer/Host
  submitUserKyc: async (formData) => {
    // Note: We don't manually set Content-Type to multipart/form-data here;
    // Axios/Fetch does it automatically when it sees FormData.
    const response = await api.post('/kyc/user', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Check Status
  getKycStatus: async () => {
    const response = await api.get('/kyc/status');
    return response.data; // Expected: { status: 'missing'|'pending'|'approved', rejectionReason: ... }
  },
};

export default kycService;