'use client';

import { Button } from "@/components/ui/button";
import { Card } from '@/components/ui/card';
import { ArrowRight, Shield, Sparkles, Clock } from "lucide-react";
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
        {/* Hero Section - White Background */}
        <section className="w-full flex items-center justify-center bg-white dark:bg-gray-950 min-h-screen">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter text-gray-900 dark:text-white sm:text-4xl md:text-5xl lg:text-6xl font-headline">
                  Your Ride, Your Adventure
                </h1>
                <p className="mx-auto max-w-[600px] text-gray-600 dark:text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl px-4">
                  Discover the perfect vehicle for your Cebu journey. Unbeatable prices, unmatched freedom, and a seamless booking experience.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 sm:space-x-4 w-full sm:w-auto px-4 sm:px-0">
                <Button size="lg" asChild className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Link href="/login">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Orange Arc Background */}
        <section className="relative w-full py-12 md:py-24 lg:py-32 bg-orange-500 dark:bg-orange-600 overflow-hidden">
          {/* Arc Shape */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/4 left-1/2 transform -translate-x-1/2 w-[200%] h-[150%] bg-white dark:bg-gray-950 rounded-[50%]"></div>
          </div>
          
           <FadeInSection>
            <div className="container px-4 md:px-6 relative z-10">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-orange-600 dark:bg-orange-700 text-white px-3 py-1 text-sm font-semibold">Key Features</div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline text-gray-900 dark:text-white">Why Choose Sakay Cebu?</h2>
                        <p className="max-w-[900px] text-gray-600 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            We provide a trusted and easy-to-use platform for both vehicle owners and renters in Cebu.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-3 lg:gap-12">
                    <Card className="flex flex-col items-center justify-center p-6 text-center space-y-2 bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-shadow">
                      <Shield className="h-10 w-10 text-orange-500" />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Verified Listings</h3>
                      <p className="text-gray-600 dark:text-gray-400">Every vehicle and provider is vetted for your safety and peace of mind.</p>
                    </Card>
                    <Card className="flex flex-col items-center justify-center p-6 text-center space-y-2 bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-shadow">
                        <Sparkles className="h-10 w-10 text-orange-500" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI-Powered Deals</h3>
                        <p className="text-gray-600 dark:text-gray-400">Get smart, personalized promotion suggestions based on real-time data.</p>
                    </Card>
                    <Card className="flex flex-col items-center justify-center p-6 text-center space-y-2 bg-white dark:bg-gray-900 border-2 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-shadow">
                      <Clock className="h-10 w-10 text-orange-500" />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Easy Booking</h3>
                      <p className="text-gray-600 dark:text-gray-400">Find and book your ideal vehicle in just a few clicks.</p>
                    </Card>
                </div>
            </div>
          </FadeInSection>
        </section>

        {/* CTA Section - White Background */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
           <FadeInSection>
            <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
                <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline text-gray-900 dark:text-white">Ready to Hit the Road?</h2>
                <p className="mx-auto max-w-[600px] text-gray-600 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Join thousands of happy renters and providers. Create an account and start your journey today.
                </p>
                </div>
                <div className="mx-auto w-full max-w-sm">
                    <Button asChild className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                        <Link href="/login">
                            Get Started Now
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </div>
           </FadeInSection>
        </section>
      </main>
      <footer className="border-t bg-orange-500 dark:bg-orange-600">
        <div className="container mx-auto py-4 px-6">
            <p className="text-center text-sm text-white">
            © {new Date().getFullYear()} Sakay Cebu. All rights reserved.
            </p>
        </div>
      </footer>
    </div>
  );
}
