
"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Provider } from '@/lib/types';
import useLocalStorage from './use-local-storage';
import { initialUsers, initialProviders } from '@/lib/data';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string, role: 'user' | 'provider') => boolean;
  logout: () => void;
  users: User[];
  providers: Provider[];
  setUsers: (users: User[]) => void;
  setProviders: (providers: Provider[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalStorage<User | null>('sakay-cebu-user', null);
  const [users, setUsers] = useLocalStorage<User[]>('sakay-cebu-users', initialUsers);
  const [providers, setProviders] = useLocalStorage<Provider[]>('sakay-cebu-providers', initialProviders);
  const router = useRouter();

  const login = (email: string, password: string): boolean => {
    const allUsers = [...users, ...providers];
    const foundUser = allUsers.find(u => u.email === email && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      if (foundUser.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (foundUser.role === 'provider') {
        router.push('/provider/dashboard');
      } else {
        router.push('/dashboard');
      }
      return true;
    }
    return false;
  };

  const signup = (name: string, email: string, password: string, role: 'user' | 'provider'): boolean => {
    const allUsers = [...users, ...providers];
    const existingUser = allUsers.find(u => u.email === email);
    if (existingUser) {
      return false; // User already exists
    }

    const newUser: User | Provider = {
      id: `${role}-${Date.now()}`,
      name,
      email,
      password,
      role,
      ...(role === 'provider' && { verified: false }),
    };

    if (role === 'user') {
      setUsers([...users, newUser as User]);
    } else {
      setProviders([...providers, newUser as Provider]);
    }
    
    return true;
  };

  const logout = () => {
    // Clear user state
    setUser(null);
    // Clear localStorage
    localStorage.removeItem('sakay-cebu-user');
    // Force immediate redirect
    window.location.replace('/login');
  };

  const value = { user, login, signup, logout, users, providers, setUsers, setProviders };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
