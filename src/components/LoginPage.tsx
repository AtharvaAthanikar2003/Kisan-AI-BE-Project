import React, { useState, useEffect } from 'react';
import { LogIn, AlertCircle, Loader, KeyRound, UserPlus, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type AuthView = 'login' | 'register' | 'reset-password';

const LoginPage = () => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { login, register, resetPassword } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      switch (view) {
        case 'login':
          await login(email, password);
          break;
        case 'register':
          if (password !== confirmPassword) {
            throw new Error('Passwords do not match');
          }
          await register(email, password, name);
          setMessage('Registration successful! Please check your email to verify your account.');
          setView('login');
          break;
        case 'reset-password':
          await resetPassword(email);
          setMessage('Password reset instructions have been sent to your email.');
          break;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (newView: AuthView) => {
    setError(null);
    setMessage(null);
    setView(newView);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-md w-full">
        {/* Logo and Branding */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white dark:bg-gray-800 shadow-lg mb-4 animate-bounce-subtle hover-lift">
            <LogIn className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 animate-slide-in delay-1">
            KisanAI
          </h1>
          <p className="text-gray-600 dark:text-gray-400 animate-slide-in delay-2">
            Smart Farming Solutions For Sustainable future
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden animate-scale-in delay-3 hover-lift">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => handleViewChange('login')}
              className={`flex-1 py-4 text-sm font-medium transition-all duration-300 tab-indicator ${
                view === 'login'
                  ? 'text-green-600 border-b-2 border-green-600 active'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleViewChange('register')}
              className={`flex-1 py-4 text-sm font-medium transition-all duration-300 tab-indicator ${
                view === 'register'
                  ? 'text-green-600 border-b-2 border-green-600 active'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Register
            </button>
          </div>

          <div className="p-8">
            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 animate-slide-in">
              {view === 'login' && 'Welcome Back'}
              {view === 'register' && 'Create Account'}
              {view === 'reset-password' && 'Reset Password'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 animate-slide-in delay-1">
              {view === 'login' && 'Sign in to access your farm dashboard'}
              {view === 'register' && 'Join Kisan AI to manage your farm'}
              {view === 'reset-password' && 'Enter your email to reset your password'}
            </p>

            {/* Alerts */}
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg flex items-center gap-2 animate-scale-in">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {message && (
              <div className="mb-6 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-4 rounded-lg animate-scale-in">
                <p className="text-sm">{message}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {view === 'register' && (
                <div className="form-group animate-slide-in delay-1">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 focus-transition"
                      placeholder="Enter name"
                    />
                  </div>
                </div>
              )}

              <div className="form-group animate-slide-in delay-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 focus-transition"
                    placeholder="abc@123.com"
                  />
                </div>
              </div>

              {view !== 'reset-password' && (
                <div className="form-group animate-slide-in delay-3">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 focus-transition"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              {view === 'register' && (
                <div className="form-group animate-slide-in delay-4">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 focus-transition"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed button-hover animate-scale-in delay-4 animate-pulse-subtle"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Please wait...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    {view === 'login' && (
                      <>
                        <LogIn className="h-5 w-5" />
                        <span>Sign in</span>
                      </>
                    )}
                    {view === 'register' && (
                      <>
                        <UserPlus className="h-5 w-5" />
                        <span>Create Account</span>
                      </>
                    )}
                    {view === 'reset-password' && (
                      <>
                        <KeyRound className="h-5 w-5" />
                        <span>Reset Password</span>
                      </>
                    )}
                  </div>
                )}
              </button>

              {/* Additional Links */}
              <div className="text-center space-y-2 animate-fade-in delay-4">
                {view === 'login' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleViewChange('reset-password')}
                      className="text-sm text-green-600 hover:text-green-500 transition-colors hover:underline focus:outline-none focus:ring-2 focus:ring-green-500 rounded-lg px-2 py-1"
                    >
                      Forgot your password?
                    </button>
                  </>
                )}
                {view === 'reset-password' && (
                  <button
                    type="button"
                    onClick={() => handleViewChange('login')}
                    className="text-sm text-green-600 hover:text-green-500 transition-colors hover:underline focus:outline-none focus:ring-2 focus:ring-green-500 rounded-lg px-2 py-1"
                  >
                    Back to Sign In
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 animate-fade-in delay-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            By continuing, you agree to our{' '}
            <a href="#" className="text-green-600 hover:text-green-500 transition-colors hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-green-600 hover:text-green-500 transition-colors hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;