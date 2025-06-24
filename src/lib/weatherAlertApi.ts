import axios from 'axios';

export interface WeatherAlert {
  headline: string;
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Extreme';
  urgency: string;
  areas: string;
  category: string;
  certainty: string;
  event: string;
  note: string;
  effective: string;
  expires: string;
  desc: string;
  instruction: string;
}

export interface WeatherAlertResponse {
  alerts: WeatherAlert[];
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
  };
}

class WeatherAlertAPI {
  private static API_KEY = import.meta.env.VITE_WEATHERAPI_KEY;
  private static BASE_URL = 'https://api.weatherapi.com/v1';

  static async getAlerts(location: string): Promise<WeatherAlertResponse> {
    try {
      if (!this.API_KEY) {
        throw new Error('WeatherAPI key is not configured');
      }

      const response = await axios.get(`${this.BASE_URL}/forecast.json`, {
        params: {
          key: this.API_KEY,
          q: location,
          alerts: 'yes',
          days: 1
        }
      });

      if (!response.data) {
        throw new Error('Invalid response format from WeatherAPI');
      }

      return {
        alerts: response.data.alerts?.alert || [],
        location: response.data.location
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid WeatherAPI key');
        }
        throw new Error(`Weather Alert API error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  static getSeverityColor(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'minor':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'moderate':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'severe':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'extreme':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }
}

export default WeatherAlertAPI;