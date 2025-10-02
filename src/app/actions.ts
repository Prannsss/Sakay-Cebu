'use server';

import { personalizedPromotionSuggestions } from '@/ai/flows/personalized-promotion-suggestions';
import { z } from 'zod';

const formSchema = z.object({
  location: z.string().min(2, {
    message: 'Location must be at least 2 characters.',
  }),
});

interface FormState {
    message: string;
    suggestions?: string;
    errors?: {
        location?: string[];
    };
}

export async function getSmartDeals(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = formSchema.safeParse({
    location: formData.get('location'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid location.',
    };
  }

  const { location } = validatedFields.data;
  
  // Mocking data as per instructions
  const currentDateTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });
  const weather = 'Sunny with a chance of afternoon showers'; // Mocked
  const localEvents = `Current events for Cebu City: Preparations for a major music festival are ongoing. A food bazaar is happening at Ayala Center Cebu this weekend.`; // Mocked for Cebu

  try {
    const result = await personalizedPromotionSuggestions({
      vehicleLocation: location,
      currentDateTime,
      weather,
      localEvents,
    });
    return {
      message: 'Success',
      suggestions: result.promotionSuggestions,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'Failed to get suggestions from AI. Please try again later.',
    };
  }
}
