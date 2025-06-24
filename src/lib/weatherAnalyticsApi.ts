import axios from 'axios';

class WeatherAnalyticsAPI {
  private static API_KEY = import.meta.env.VITE_VISUALCROSSING_ANALYTICS_API_KEY;
  private static BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

  static async getAnalyticsData(location: string) {
    try {
      if (!this.API_KEY) {
        throw new Error('Visual Crossing Analytics API key is not configured');
      }

      const response = await axios.get(`${this.BASE_URL}/${encodeURIComponent(location)}`, {
        params: {
          key: this.API_KEY,
          unitGroup: 'metric',
          include: 'obs,stats',
          elements: [
            'datetime',
            'datetimeEpoch',
            'tempmax',
            'tempmin',
            'temp',
            'dew',
            'humidity',
            'precip',
            'preciptype',
            'snow',
            'snowdepth',
            'windspeed',
            'windspeedmax',
            'windspeedmin',
            'winddir',
            'sunrise',
            'sunset',
            'moonphase',
            'conditions',
            'description',
            'icon',
            'windspeed50',
            'winddir50',
            'dniradiation',
            'soiltemp01',
            'soilmoisture01',
            'et0'
          ].join(','),
          contentType: 'json'
        }
      });

      if (!response.data) {
        throw new Error('Invalid response format from Visual Crossing API');
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid Visual Crossing Analytics API key');
        }
        if (error.response?.status === 429) {
          throw new Error('API rate limit exceeded');
        }
        throw new Error(`Weather Analytics API error: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }
}

export default WeatherAnalyticsAPI;