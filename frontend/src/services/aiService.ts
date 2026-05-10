import { apiFetch } from './api';

export const aiService = {
  async generateItinerary(data: {
    destination: string;
    numberOfDays: number;
    budget: number;
    interests: string[];
  }) {
    return apiFetch('/ai/generate-itinerary', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
