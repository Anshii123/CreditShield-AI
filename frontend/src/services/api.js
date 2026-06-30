import axios from 'axios';

// Configure Axios with base URL matching the Vite dev proxy prefix, supporting environment override in production
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  /**
   * Fetches general ML model status indicators.
   */
  async getModelStatus() {
    try {
      const response = await client.get('/model/status');
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.detail || error.message || 'Failed to load model status';
      throw new Error(msg);
    }
  },

  /**
   * Returns exact metrics performance summary of the active model.
   * Resolves to /api/model-performance.
   */
  async getModelPerformance() {
    try {
      const response = await client.get('/model-performance');
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.detail || error.message || 'Failed to load model performance';
      throw new Error(msg);
    }
  },

  /**
   * Triggers model parameters optimization.
   * Resolves to /api/train.
   */
  async trainModel() {
    try {
      const response = await client.post('/train');
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.detail || error.message || 'Training request failed';
      throw new Error(msg);
    }
  },

  /**
   * Submits applicant factors and calculates delinquency risk.
   * Resolves to /api/predict.
   */
  async predictDefault(applicationData) {
    try {
      const response = await client.post('/predict', applicationData);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.detail || error.message || 'Prediction analysis failed';
      throw new Error(msg);
    }
  },

  /**
   * Uploads and replaces the active credit risk dataset CSV.
   * Resolves to /api/dataset/upload.
   */
  async uploadDataset(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await client.post('/dataset/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.detail || error.message || 'Dataset upload failed';
      throw new Error(msg);
    }
  },

  /**
   * Loads first rows of active dataset database.
   * Resolves to /api/dataset/preview.
   */
  async getDatasetPreview() {
    try {
      const response = await client.get('/dataset/preview');
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.detail || error.message || 'Failed to load dataset preview';
      throw new Error(msg);
    }
  },

  /**
   * Computes aggregates demographic risk variables.
   * Resolves to /api/dashboard/stats.
   */
  async getDashboardStats() {
    try {
      const response = await client.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.detail || error.message || 'Failed to fetch dashboard stats';
      throw new Error(msg);
    }
  },
};
