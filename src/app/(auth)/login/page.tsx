'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

import LoginForm from '@/components/auth/LoginForm';
import SignUpForm from '@/components/auth/SignUpForm';
import Logo from '@/components/Logo';

type AuthMode = 'login' | 'signup';

const AuthPage = () => {
  const [mode, setMode] = useState<AuthMode>('login');

  const toggleMode = () => {
    setMode(prevMode => (prevMode === 'login' ? 'signup' : 'login'));
  };

  const isSignup = mode === 'signup';

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <div className="relative flex h-auto min-h-[600px] sm:h-[75vh] w-full max-w-4xl overflow-hidden rounded-xl bg-card text-card-foreground shadow-2xl">
        {/* Animated Panel - Desktop Only */}
        <motion.div
          key="auth-panel"
          className="absolute top-0 bottom-0 z-10 hidden w-1/2 flex-col items-center justify-center bg-primary p-8 text-primary-foreground lg:flex"
          initial={{ x: '0%' }}
          animate={{ x: isSignup ? '0%' : '100%' }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
        >
          <div className='flex flex-col items-center gap-4'>
            <Zap className="h-16 w-16" />
            <span className="text-2xl font-bold font-headline">Sakay Cebu</span>
          </div>
        </motion.div>

        {/* Mobile Only - Simple form switching without animation */}
        <div className="flex w-full flex-col items-center justify-center p-4 sm:p-6 md:hidden">
          {/* Mobile Header with Logo */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <Logo />
          </div>
          
          {/* Mobile Forms */}
          <div className="w-full max-w-md">
            {isSignup ? (
              <SignUpForm onToggleMode={toggleMode} />
            ) : (
              <LoginForm onToggleMode={toggleMode} />
            )}
          </div>
        </div>

        {/* Desktop Left - Original Logic */}
        <div className="hidden md:flex w-1/2 items-center justify-center p-4 sm:p-6 md:p-8">
             <AnimatePresence mode="wait">
                <motion.div
                    key={mode === 'signup' ? 'signup' : 'login'}
                    initial={{ opacity: 0, x: isSignup ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isSignup ? -20 : 20 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="w-full"
                >
                    {isSignup ? <div /> : <LoginForm onToggleMode={toggleMode} />}
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Desktop Right - Original Logic */}
        <div className="hidden w-1/2 items-center justify-center p-4 sm:p-6 md:p-8 md:flex">
            <AnimatePresence mode="wait">
                <motion.div
                    key={mode === 'login' ? 'signup' : 'login'}
                    initial={{ opacity: 0, x: isSignup ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isSignup ? -20 : 20 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="w-full"
                >
                     {isSignup ? <SignUpForm onToggleMode={toggleMode} /> : <div />}
                </motion.div>
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
