'use server';

/**
 * @fileOverview Provides personalized promotion suggestions for providers based on vehicle location,
 * current date/time, weather, and local events.
 * 
 * - personalizedPromotionSuggestions - A function that generates promotion suggestions.
 * - PersonalizedPromotionSuggestionsInput - The input type for the personalizedPromotionSuggestions function.
 * - PersonalizedPromotionSuggestionsOutput - The return type for the personalizedPromotionSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedPromotionSuggestionsInputSchema = z.object({
  vehicleLocation: z
    .string()
    .describe('The current location of the vehicle (e.g., city, region).'),
  currentDateTime: z.string().describe('The current date and time.'),
  weather: z.string().describe('The current weather conditions at the vehicle location.'),
  localEvents: z
    .string()
    .describe('Information about local events happening near the vehicle location.'),
});
export type PersonalizedPromotionSuggestionsInput = z.infer<
  typeof PersonalizedPromotionSuggestionsInputSchema
>;

const PersonalizedPromotionSuggestionsOutputSchema = z.object({
  promotionSuggestions: z
    .string()
    .describe(
      'A list of personalized promotion suggestions tailored to the vehicle location, current date/time, weather, and local events.'
    ),
});
export type PersonalizedPromotionSuggestionsOutput = z.infer<
  typeof PersonalizedPromotionSuggestionsOutputSchema
>;

export async function personalizedPromotionSuggestions(
  input: PersonalizedPromotionSuggestionsInput
): Promise<PersonalizedPromotionSuggestionsOutput> {
  return personalizedPromotionSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedPromotionSuggestionsPrompt',
  input: {schema: PersonalizedPromotionSuggestionsInputSchema},
  output: {schema: PersonalizedPromotionSuggestionsOutputSchema},
  prompt: `You are an AI assistant designed to provide personalized promotion suggestions for vehicle providers.

  Based on the vehicle's location, current date/time, weather, and local events, suggest promotions that would maximize rental opportunities.

  Vehicle Location: {{{vehicleLocation}}}
  Current Date/Time: {{{currentDateTime}}}
  Weather: {{{weather}}}
  Local Events: {{{localEvents}}}

  Provide a list of promotion suggestions that are most likely to attract renters given the current circumstances.
  For example, if the weather is rainy, suggest a discount for those who need a vehicle to avoid public transport. Or, if there is a local event, suggest promotions that cater to event attendees.
  Consider also the date and time. Perhaps suggest an after-work special.

  Be creative and think outside the box.
  `,
});

const personalizedPromotionSuggestionsFlow = ai.defineFlow(
  {
    name: 'personalizedPromotionSuggestionsFlow',
    inputSchema: PersonalizedPromotionSuggestionsInputSchema,
    outputSchema: PersonalizedPromotionSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
