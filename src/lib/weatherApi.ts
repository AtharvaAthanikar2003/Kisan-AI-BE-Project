import axios from 'axios';
import { format, parseISO, isValid } from 'date-fns';

export interface WeatherData {
  current: {
    temp: number;
    humidity: number;
    windSpeed: number;
    description: string;
    icon: string;
    precipitation: number;
    uvIndex: number;
    cloudCover: number;
    feelsLike: number;
    visibility: number;
    pressure: number;
  };
  forecast: Array<{
    date: string;
    temp: number;
    tempMin: number;
    tempMax: number;
    humidity: number;
    windSpeed: number;
    description: string;
    icon: string;
    precipitation: number;
    uvIndex: number;
    cloudCover: number;
    sunrise: string;
    sunset: string;
  }>;
  hourly: Array<{
    time: string;
    temp: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    cloudCover: number;
    conditions: string;
  }>;
}

class WeatherAPI {
  private static API_KEY = import.meta.env.VITE_VISUALCROSSING_API_KEY;
  private static BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

  static async getWeatherData(location: string): Promise<WeatherData> {
    try {
      if (!this.API_KEY) {
        throw new Error('Visual Crossing API key is not configured');
      }

      const response = await axios.get(
        `${this.BASE_URL}/${encodeURIComponent(location)}`, {
          params: {
            key: this.API_KEY,
            unitGroup: 'metric',
            include: 'current,hours,days',
            contentType: 'json',
            elements: 'datetime,temp,humidity,windspeed,conditions,icon,precip,uvindex,cloudcover,visibility,pressure,feelslike,sunrise,sunset,tempmin,tempmax'
          }
        }
      );

      if (!response.data) {
        throw new Error('Invalid weather data format');
      }

      const data = response.data;

      // Helper function to validate and format dates
      const formatDate = (dateString: string | undefined, formatString: string): string => {
        const parsedDate = dateString ? parseISO(dateString) : null;
        return parsedDate && isValid(parsedDate) ? format(parsedDate, formatString) : 'Invalid Date';
      };

      // Process current weather
      const current = {
        temp: Math.round(data.currentConditions.temp),
        humidity: data.currentConditions.humidity,
        windSpeed: Math.round(data.currentConditions.windspeed),
        description: data.currentConditions.conditions,
        icon: this.getWeatherIcon(data.currentConditions.icon),
        precipitation: data.currentConditions.precip || 0,
        uvIndex: data.currentConditions.uvindex,
        cloudCover: data.currentConditions.cloudcover,
        feelsLike: Math.round(data.currentConditions.feelslike),
        visibility: data.currentConditions.visibility,
        pressure: data.currentConditions.pressure
      };

      // Process daily forecast
      const forecast = data.days.slice(1, 8).map((day: any) => ({
        date: formatDate(day.datetime, 'yyyy-MM-dd'),
        temp: Math.round(day.temp),
        tempMin: Math.round(day.tempmin),
        tempMax: Math.round(day.tempmax),
        humidity: day.humidity,
        windSpeed: Math.round(day.windspeed),
        description: day.conditions,
        icon: this.getWeatherIcon(day.icon),
        precipitation: day.precip || 0,
        uvIndex: day.uvindex,
        cloudCover: day.cloudcover,
        sunrise: formatDate(day.sunrise, 'HH:mm'),
        sunset: formatDate(day.sunset, 'HH:mm')
      }));

      // Process hourly forecast for the next 24 hours
      const hourly = data.days[0]?.hours
        .concat(data.days[1]?.hours || [])
        .slice(new Date().getHours(), new Date().getHours() + 24)
        .map((hour: any) => ({
          time: formatDate(hour.datetime, 'HH:mm'),
          temp: Math.round(hour.temp),
          humidity: hour.humidity,
          windSpeed: Math.round(hour.windspeed),
          precipitation: hour.precip || 0,
          cloudCover: hour.cloudcover,
          conditions: hour.conditions
        }));

      return {
        current,
        forecast,
        hourly
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid Visual Crossing API key');
        }
        if (error.response?.status === 429) {
          throw new Error('API rate limit exceeded');
        }
        throw new Error(`Weather API error: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  private static getWeatherIcon(condition: string): string {
    const iconMap: Record<string, string> = {
      'clear-day': '☀️',
      'clear-night': '🌙',
      'partly-cloudy-day': '⛅',
      'partly-cloudy-night': '☁️',
      'cloudy': '☁️',
      'rain': '🌧️',
      'snow': '🌨️',
      'sleet': '🌨️',
      'wind': '💨',
      'fog': '🌫️',
      'thunder-rain': '⛈️',
      'thunder-showers-day': '⛈️',
      'thunder-showers-night': '⛈️'
    };
    return iconMap[condition] || '☀️';
  }
}

export default WeatherAPI;