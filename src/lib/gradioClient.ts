import { client } from "@gradio/client";

export interface PredictionResult {
  data: any[];
  error?: string;
}

export class GradioClient {
  private static instance: GradioClient;
  private models = {
    crop: {
      id: "shubham5027/KisanAI",
      fn_index: 0
    },
    fertilizer: {
      id: "shubham5027/KisanAI_Fertilizer_Prediction",
      fn_index: 0
    },
    rainfall: {
      id: "shubham5027/KisanAI_Rainfall",
      fn_index: 0
    }
  };

  private constructor() {}

  public static getInstance(): GradioClient {
    if (!GradioClient.instance) {
      GradioClient.instance = new GradioClient();
    }
    return GradioClient.instance;
  }

  public async predict(inputs: any, type: 'crop' | 'fertilizer' | 'rainfall'): Promise<PredictionResult> {
    try {
      const model = this.models[type];
      const app = await client(model.id);
      let inputArray: any[];
      
      switch (type) {
        case 'crop':
          inputArray = [
            inputs.nitrogen,
            inputs.phosphorus,
            inputs.potassium,
            inputs.temperature,
            inputs.humidity,
            inputs.ph,
            inputs.rainfall
          ];
          break;
        case 'fertilizer':
          inputArray = [
            inputs.soilType,
            inputs.cropType,
            inputs.temperature,
            inputs.humidity,
            inputs.nitrogen,
            inputs.phosphorous,
            inputs.potassium
          ];
          break;
        case 'rainfall':
          inputArray = [
            inputs.subdivision,
            inputs.year,
            inputs.may,
            inputs.jun,
            inputs.jul,
            inputs.aug,
            inputs.sep
          ];
          break;
      }

      const result = await app.predict(0, inputArray);

      if (!result) {
        throw new Error('No prediction data received');
      }

      return { data: Array.isArray(result) ? result : [result] };
    } catch (error) {
      console.error('Prediction error:', error);
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Prediction failed'
      };
    }
  }
}