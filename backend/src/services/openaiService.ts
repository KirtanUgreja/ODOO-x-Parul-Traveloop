import OpenAI from 'openai';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

export const generateItineraryFromAI = async (
  destination: string,
  numberOfDays: number,
  budget: number,
  interests: string[]
) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const prompt = `Generate a detailed ${numberOfDays}-day travel itinerary for ${destination} with a total budget of $${budget}. The traveler is interested in: ${interests.join(', ')}.

Return ONLY valid JSON. Do not include markdown formatting. Do not include explanations outside JSON.

JSON structure:
{
  "tripName": "A catchy name for the trip",
  "overview": "A brief overview of the experience",
  "estimatedBudget": number,
  "days": [
    {
      "day": 1,
      "activities": [
        {
          "time": "HH:MM",
          "title": "Activity name",
          "description": "What to do there",
          "location": "Specific place or landmark",
          "duration": number_in_minutes,
          "estimatedCost": number,
          "category": "one of: sightseeing, food, transport, relaxation, nightlife, culture"
        }
      ]
    }
  ],
  "tips": ["Useful travel tips for this specific destination"]
}`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('Groq returned empty content');

  // Strip markdown code fences if model wraps response anyway
  const cleaned = content.replace(/^```(?:json)?\n?|\n?```$/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    console.error('Groq response was not valid JSON:', cleaned.slice(0, 200));
    throw new Error('AI returned invalid JSON. Please try again.');
  }
};
