import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://nexo.works';

class CityService {
  constructor() {
    this.cache = {
      data: null,
      timestamp: null,
      expiry: 5 * 60 * 1000 // 5 minutes cache
    };
    this.pendingRequest = null;
  }

  // Check if cache is valid
  isCacheValid() {
    return this.cache.data && 
           this.cache.timestamp && 
           (Date.now() - this.cache.timestamp) < this.cache.expiry;
  }

  // Get enabled cities with caching
  async getEnabledCities(forceRefresh = false) {
    // Return cached data if valid and not forcing refresh
    if (!forceRefresh && this.isCacheValid()) {
      return this.cache.data;
    }

    // If there's already a pending request, wait for it
    if (this.pendingRequest) {
      return await this.pendingRequest;
    }

    // Create new request
    this.pendingRequest = this.fetchCitiesFromAPI();

    try {
      const data = await this.pendingRequest;
      
      // Cache the result
      this.cache = {
        data,
        timestamp: Date.now(),
        expiry: 5 * 60 * 1000
      };

      return data;
    } finally {
      // Clear pending request
      this.pendingRequest = null;
    }
  }

  // Actual API call
  async fetchCitiesFromAPI() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/cities/enabled`, {
        timeout: 10000
      });

      if (response.data && response.data.success) {
        return response.data.data || [];
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      throw error;
    }
  }

  // Find a specific city by ID
  async findCityById(cityId, forceRefresh = false) {
    const cities = await this.getEnabledCities(forceRefresh);
    return cities.find(city => city._id === cityId);
  }

  // Verify if a city is still enabled
  async verifyCityStatus(cityId) {
    try {
      const city = await this.findCityById(cityId);
      return city && city.isEnabled;
    } catch (error) {
      console.error('Error verifying city status:', error);
      return false;
    }
  }

  // Clear cache (useful when cities are updated)
  clearCache() {
    this.cache = {
      data: null,
      timestamp: null,
      expiry: 5 * 60 * 1000
    };
  }

  // Refresh cache
  async refreshCache() {
    return await this.getEnabledCities(true);
  }
}

// Export singleton instance
export const cityService = new CityService();
export default cityService;