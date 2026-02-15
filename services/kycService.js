import api from './api';

const kycService = {
  // Submit KYC for Customer/Host
  submitUserKyc: async (formData) => {
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
    return response.data; // { status: 'missing'|'pending'|'approved'|'rejected', rejectionReason: ... }
  },
};

export default kycService;