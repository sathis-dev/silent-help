'use client';

/**
 * Silent Help - Authentication Demo Page
 * Preview the new login/signup/guest system
 */

import React, { useState, useCallback } from 'react';
import { AuthFlow } from '@/components/auth';
import { AuthUser, GuestUser } from '@/lib/types/auth';

export default function AuthDemoPage() {
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthUser | GuestUser | null>(null);

  const handleAuthComplete = useCallback((user: AuthUser | GuestUser) => {
    console.log('Authentication complete:', user);
    setAuthenticatedUser(user);
  }, []);

  const handleLogout = useCallback(() => {
    // Clear storage
    localStorage.removeItem('silent_help_auth_user');
    localStorage.removeItem('silent_help_guest_user');
    setAuthenticatedUser(null);
  }, []);

  // If authenticated, show welcome screen
  if (authenticatedUser) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ background: '#020617' }}
      >
        <div className="max-w-md w-full text-center space-y-8">
          {/* Success Animation */}
          <div className="relative w-24 h-24 mx-auto">
            <div 
              className="absolute inset-0 rounded-full animate-pulse"
              style={{
                background: 'radial-gradient(circle, rgba(127, 219, 202, 0.3), transparent 70%)',
              }}
            />
            <div 
              className="absolute inset-0 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(180, 167, 214, 0.2), rgba(127, 219, 202, 0.2))',
                border: '1px solid rgba(180, 167, 214, 0.3)',
              }}
            >
              <svg 
                className="w-12 h-12 text-green-400"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Welcome Message */}
          <div>
            <h1 
              className="text-3xl font-light tracking-wide mb-2"
              style={{
                background: 'linear-gradient(135deg, #D8D0E8 0%, #B8F0E4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Welcome, {authenticatedUser.displayName}!
            </h1>
            <p className="text-slate-400 text-sm">
              {authenticatedUser.isGuest 
                ? 'You\'re browsing as a guest. Your session lasts 24 hours.'
                : 'Your sanctuary awaits.'}
            </p>
          </div>

          {/* User Info Card */}
          <div 
            className="p-6 rounded-2xl text-left space-y-4"
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.15)',
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(180, 167, 214, 0.3), rgba(127, 219, 202, 0.3))',
                }}
              >
                {authenticatedUser.displayName?.charAt(0).toUpperCase() || '👤'}
              </div>
              <div>
                <p className="text-white font-medium">{authenticatedUser.displayName}</p>
                <p className="text-slate-400 text-sm">
                  {authenticatedUser.isGuest ? 'Guest User' : (authenticatedUser as AuthUser).email}
                </p>
              </div>
              <span 
                className="ml-auto px-3 py-1 rounded-full text-xs"
                style={{
                  background: authenticatedUser.isGuest 
                    ? 'rgba(245, 158, 11, 0.2)' 
                    : 'rgba(16, 185, 129, 0.2)',
                  color: authenticatedUser.isGuest ? '#FBBF24' : '#10B981',
                }}
              >
                {authenticatedUser.isGuest ? 'Guest' : 'Member'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs text-slate-500">
              <p>ID: {authenticatedUser.id}</p>
              <p>Joined: {new Date(authenticatedUser.createdAt).toLocaleString()}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full py-4 rounded-2xl font-medium text-white transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #B4A7D6 0%, #7FDBCA 100%)',
                color: '#020617',
              }}
            >
              Continue to Sanctuary
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-xl text-sm transition-all hover:opacity-80"
              style={{
                background: 'rgba(15, 23, 42, 0.4)',
                color: '#94A3B8',
                border: '1px solid rgba(148, 163, 184, 0.2)',
              }}
            >
              Sign Out & Return to Auth
            </button>
          </div>

          {/* Upgrade prompt for guests */}
          {authenticatedUser.isGuest && (
            <div 
              className="p-4 rounded-xl flex items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, rgba(180, 167, 214, 0.1), rgba(127, 219, 202, 0.1))',
                border: '1px solid rgba(180, 167, 214, 0.2)',
              }}
            >
              <svg 
                className="w-5 h-5 text-amber-400 shrink-0" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <p className="text-sm text-slate-300">
                Create an account to save your progress permanently
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show auth flow
  return <AuthFlow onAuthComplete={handleAuthComplete} />;
}
