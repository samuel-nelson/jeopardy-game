import axios from 'axios';

// Use Netlify Functions in production, local server in development
const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (isProduction ? '/.netlify/functions' : 'http://localhost:5000/api');

// Helper to build API URLs
const buildUrl = (path: string) => {
  if (isProduction && !process.env.REACT_APP_API_URL) {
    // Netlify Functions - path is included in the function route
    return `/.netlify/functions/questions?path=${encodeURIComponent(path)}`;
  }
  return `${API_BASE_URL}${path}`;
};

export const api = {
  getDefaultQuestions: async () => {
    const url = isProduction && !process.env.REACT_APP_API_URL
      ? '/.netlify/functions/questions?path=/questions/default'
      : `${API_BASE_URL}/questions/default`;
    const response = await axios.get(url);
    return response.data;
  },

  getCustomQuestionSets: async () => {
    const url = isProduction && !process.env.REACT_APP_API_URL
      ? '/.netlify/functions/questions?path=/questions/custom'
      : `${API_BASE_URL}/questions/custom`;
    const response = await axios.get(url);
    return response.data;
  },

  getCustomQuestionSet: async (id: string) => {
    const url = isProduction && !process.env.REACT_APP_API_URL
      ? `/.netlify/functions/questions?path=/questions/custom/${id}`
      : `${API_BASE_URL}/questions/custom/${id}`;
    const response = await axios.get(url);
    return response.data;
  },

  saveCustomQuestionSet: async (questionSet: any) => {
    const url = isProduction && !process.env.REACT_APP_API_URL
      ? '/.netlify/functions/questions?path=/questions/custom'
      : `${API_BASE_URL}/questions/custom`;
    const response = await axios.post(url, questionSet);
    return response.data;
  },

  deleteCustomQuestionSet: async (id: string) => {
    const url = isProduction && !process.env.REACT_APP_API_URL
      ? `/.netlify/functions/questions?path=/questions/custom/${id}`
      : `${API_BASE_URL}/questions/custom/${id}`;
    const response = await axios.delete(url);
    return response.data;
  },
};

