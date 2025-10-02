'use client';

import { Button } from "@/components/ui/button";
import { Card } from '@/components/ui/card';
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef } from 'react';
import { ThemeToggle } from "@/components/theme-toggle";
import Logo from "@/components/Logo";

function FadeInSection({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0');
          entry.target.classList.add('animate-fade-in-up');
        }
      },
      {
        threshold: 0.1,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div ref={ref} className="opacity-0">
      {children}
    </div>
  );
}


export default function Home() {
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
            <Logo />
            <div className="flex flex-1 items-center justify-end space-x-2">
                <nav className="flex items-center space-x-2 sm:space-x-4">
                    <ThemeToggle />
                    <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/login">
                        <span className="hidden sm:inline">Sign Up</span>
                        <span className="sm:hidden">Join</span>
                      </Link>
                    </Button>
                </nav>
            </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full flex items-center justify-center bg-background min-h-screen">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter text-foreground sm:text-4xl md:text-5xl lg:text-6xl font-headline">
                  Your Ride, Your Adventure
                </h1>
                <p className="mx-auto max-w-[600px] text-muted-foreground text-sm sm:text-base md:text-lg lg:text-xl px-4">
                  Discover the perfect vehicle for your Cebu journey. Unbeatable prices, unmatched freedom, and a seamless booking experience.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 sm:space-x-4 w-full sm:w-auto px-4 sm:px-0">
                <Button size="lg" asChild>
                  <Link href="/login">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
           <FadeInSection>
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Why Choose Sakay Cebu?</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            We provide a trusted and easy-to-use platform for both vehicle owners and renters in Cebu.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
                    <Card className="flex flex-col items-center justify-center p-6 text-center space-y-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-primary"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                      <h3 className="text-xl font-bold">Verified Listings</h3>
                      <p className="text-muted-foreground">Every vehicle and provider is vetted for your safety and peace of mind.</p>
                    </Card>
                    <Card className="flex flex-col items-center justify-center p-6 text-center space-y-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-primary"><path d="M12 8c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4Z"/><path d="M21 12H3"/><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.21 0 4.21.8 5.8 2.15"/></svg>
                        <h3 className="text-xl font-bold">AI-Powered Deals</h3>
                        <p className="text-muted-foreground">Get smart, personalized promotion suggestions based on real-time data.</p>
                    </Card>
                    <Card className="flex flex-col items-center justify-center p-6 text-center space-y-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-primary"><path d="m14.5 13-1.5-1.5 2-2a1 1 0 0 0-1.414-1.414l-2 2L10.5 8 9 9.5l1.5 1.5-2 2a1 1 0 0 0 0 1.414l.086.086a1 1 0 0 0 1.414 0l2-2 1.5 1.5L16 14.5z"/><circle cx="12" cy="12" r="10"/></svg>
                      <h3 className="text-xl font-bold">Easy Booking</h3>
                      <p className="text-muted-foreground">Find and book your ideal vehicle in just a few clicks.</p>
                    </Card>
                </div>
            </div>
          </FadeInSection>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
           <FadeInSection>
            <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
                <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">Ready to Hit the Road?</h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Join thousands of happy renters and providers. Create an account or start browsing vehicles now.
                </p>
                </div>
                <div className="mx-auto w-full max-w-sm space-x-2 flex">
                    <Button asChild className="flex-1">
                        <Link href="/login">
                            Get Started
                        </Link>
                    </Button>
                     <Button asChild variant="secondary" className="flex-1">
                        <Link href="/vehicles">
                            Explore Vehicles
                        </Link>
                    </Button>
                </div>
            </div>
           </FadeInSection>
        </section>
      </main>
      <footer className="border-t bg-background">
        <div className="container mx-auto py-4 px-6">
            <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Sakay Cebu. All rights reserved.
            </p>
        </div>
      </footer>
    </div>
  );
}
