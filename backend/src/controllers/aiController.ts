import { Response } from 'express';
import { generateItineraryFromAI } from '../services/openaiService';
import { RequestWithUser } from '../middleware/auth';

// @desc    Generate a travel itinerary using AI
// @route   POST /api/ai/generate-itinerary
// @access  Private
export const generateItinerary = async (req: RequestWithUser, res: Response) => {
  try {
    const { destination, numberOfDays, budget, interests } = req.body;

    if (!destination || !numberOfDays || !budget) {
      return res.status(400).json({
        success: false,
        message: 'Destination, number of days, and budget are required',
      });
    }

    const itinerary = await generateItineraryFromAI(
      destination,
      numberOfDays,
      budget,
      interests || []
    );

    res.json({
      success: true,
      data: itinerary,
    });
  } catch (error: any) {
    console.error('AI Controller Error:', error);
    res.status(500).json({
      success: false,
      message: error.message?.includes('GROQ_API_KEY')
        ? 'Groq API key is not configured. Add GROQ_API_KEY to your .env file.'
        : 'AI itinerary generation failed',
      error: error.message,
    });
  }
};
