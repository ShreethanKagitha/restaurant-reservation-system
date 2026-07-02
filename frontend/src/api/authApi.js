import axiosClient from './axiosClient';

const authApi = {
  /**
   * Log in user with email and password.
   * @param {Object} credentials - email and password
   */
  login: async ({ email, password }) => {
    const response = await axiosClient.post('/auth/login', { email, password });
    return response.data;
  },

  /**
   * Register a new Customer.
   * @param {Object} userData - name, email, password, confirmPassword
   */
  register: async ({ name, email, password, confirmPassword }) => {
    const response = await axiosClient.post('/auth/register', {
      name,
      email,
      password,
      confirmPassword
    });
    return response.data;
  },

  /**
   * Fetch currently logged-in user profile.
   */
  getMe: async () => {
    const response = await axiosClient.get('/auth/me');
    return response.data;
  }
};

export default authApi;
