import { supabase } from './supabase';

export interface CropHealthData {
  id: string;
  crop_name: string;
  soil_moisture: number;
  growth_stage: string;
  growth_percentage: number;
  pest_risk: 'low' | 'medium' | 'high';
  pest_risk_percentage: number;
  disease_risk: 'low' | 'medium' | 'high';
  disease_risk_percentage: number;
  last_updated: string;
}

class CropHealthAPI {
  static async getCropHealthData(): Promise<CropHealthData> {
    try {
      // In a real application, you would fetch this from your Supabase database
      // For now, we'll return mock data
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate slightly randomized data for demonstration purposes
      const soilMoisture = Math.floor(65 + Math.random() * 20);
      const growthPercentage = Math.floor(50 + Math.random() * 30);
      
      // Determine pest risk based on random factors
      let pestRisk: 'low' | 'medium' | 'high';
      let pestRiskPercentage: number;
      
      const pestRandom = Math.random();
      if (pestRandom < 0.6) {
        pestRisk = 'low';
        pestRiskPercentage = Math.floor(5 + Math.random() * 20);
      } else if (pestRandom < 0.9) {
        pestRisk = 'medium';
        pestRiskPercentage = Math.floor(40 + Math.random() * 20);
      } else {
        pestRisk = 'high';
        pestRiskPercentage = Math.floor(70 + Math.random() * 25);
      }
      
      // Determine disease risk based on random factors
      let diseaseRisk: 'low' | 'medium' | 'high';
      let diseaseRiskPercentage: number;
      
      const diseaseRandom = Math.random();
      if (diseaseRandom < 0.7) {
        diseaseRisk = 'low';
        diseaseRiskPercentage = Math.floor(5 + Math.random() * 15);
      } else if (diseaseRandom < 0.95) {
        diseaseRisk = 'medium';
        diseaseRiskPercentage = Math.floor(35 + Math.random() * 20);
      } else {
        diseaseRisk = 'high';
        diseaseRiskPercentage = Math.floor(65 + Math.random() * 30);
      }
      
      // Determine growth stage based on growth percentage
      let growthStage: string;
      if (growthPercentage < 20) {
        growthStage = 'Seedling';
      } else if (growthPercentage < 40) {
        growthStage = 'Vegetative';
      } else if (growthPercentage < 60) {
        growthStage = 'Flowering';
      } else if (growthPercentage < 80) {
        growthStage = 'Fruiting';
      } else {
        growthStage = 'Maturity';
      }
      
      return {
        id: '1',
        crop_name: 'Wheat',
        soil_moisture: soilMoisture,
        growth_stage: growthStage,
        growth_percentage: growthPercentage,
        pest_risk: pestRisk,
        pest_risk_percentage: pestRiskPercentage,
        disease_risk: diseaseRisk,
        disease_risk_percentage: diseaseRiskPercentage,
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching crop health data:', error);
      throw new Error('Failed to fetch crop health data');
    }
  }
  
  static async getCropHealthHistory(): Promise<CropHealthData[]> {
    // This would fetch historical data in a real application
    // For now, we'll return mock data
    
    const mockHistory: CropHealthData[] = [];
    const now = new Date();
    
    // Generate data for the past 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      mockHistory.push({
        id: `history-${i}`,
        crop_name: 'Wheat',
        soil_moisture: Math.floor(60 + Math.random() * 30),
        growth_stage: 'Flowering',
        growth_percentage: Math.floor(40 + i * 5 + Math.random() * 5),
        pest_risk: Math.random() < 0.7 ? 'low' : 'medium',
        pest_risk_percentage: Math.floor(10 + Math.random() * 40),
        disease_risk: Math.random() < 0.8 ? 'low' : 'medium',
        disease_risk_percentage: Math.floor(5 + Math.random() * 30),
        last_updated: date.toISOString()
      });
    }
    
    return mockHistory;
  }
}

export default CropHealthAPI;