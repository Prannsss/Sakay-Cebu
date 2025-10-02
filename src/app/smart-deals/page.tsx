'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { getSmartDeals } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
      Get Smart Deals
    </Button>
  );
}

export default function SmartDealsPage() {
  const initialState = { message: '', suggestions: '' };
  const [state, formAction] = useFormState(getSmartDeals, initialState);
  const { toast } = useToast();

    useEffect(() => {
        if (state.message === 'Failed to get suggestions from AI.') {
            toast({
                variant: 'destructive',
                title: 'AI Error',
                description: state.message,
            });
        }
    }, [state, toast]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headline">Smart Deals AI</h1>
        <p className="text-muted-foreground mt-2">Find personalized promotions based on your location and current events in Cebu.</p>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Find Your Deal</CardTitle>
            <CardDescription>Enter a location in Cebu to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Your Location</Label>
              <Input id="location" name="location" placeholder="e.g., IT Park, Cebu City" required />
              {state.errors?.location && (
                <p className="text-sm font-medium text-destructive">{state.errors.location.join(', ')}</p>
              )}
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>

      {state.suggestions && (
        <Card className='bg-primary/10 border-primary'>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-primary" />
              Your Personalized Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
              {state.suggestions}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
