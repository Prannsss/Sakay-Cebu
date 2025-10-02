'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

// This page redirects to login with signup mode
export default function SignupRedirect() {
  useEffect(() => {
    // Redirect to login page which handles both login and signup
    window.location.href = '/login';
  }, []);

  return null;
}