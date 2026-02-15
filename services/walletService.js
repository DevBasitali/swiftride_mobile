// services/walletService.js
import api from "./api";

/**
 * Get current user's wallet balance
 * @returns {Promise} Wallet data with balanceAvailable and balancePending
 */
export const getWallet = async () => {
    const response = await api.get("/wallets/me");
    return response.data;
};

/**
 * Get wallet transaction history
 * @param {number} limit - Number of transactions to fetch
 * @returns {Promise} Array of transactions
 */
export const getTransactions = async (limit = 50) => {
    const response = await api.get(`/wallets/me/transactions?limit=${limit}`);
    return response.data;
};

/**
 * Request a withdrawal from wallet
 * @param {number} amount - Amount to withdraw
 * @param {Object} bankDetails - Bank account details { bankName, accountTitle, accountNumber, iban? }
 * @returns {Promise} Withdrawal request object
 */
export const requestWithdrawal = async (amount, bankDetails) => {
    const response = await api.post("/wallets/withdraw", { amount, bankDetails });
    return response.data;
};

export default {
    getWallet,
    getTransactions,
    requestWithdrawal,
};
