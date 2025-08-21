import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../components/ToastContainer';
import { Target, Zap, Trophy, CheckCircle } from 'lucide-react';
import { createUserSchema, validateForm } from '../utils/validation';
import LoadingSpinner from '../components/LoadingSpinner';

interface SetupProps {
  onSetupComplete: () => void;
}

const Setup: React.FC<SetupProps> = ({ onSetupComplete }) => {
  const { createUser } = useUser();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validation = validateForm(createUserSchema, formData);
    if (!validation.success) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors in the form'
      });
      return;
    }

    setIsLoading(true);

    try {
      await createUser(validation.data);
      
      // Setup account with default habits
      const response = await fetch('/api/setup/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        showToast({
          type: 'success',
          title: 'Account Created!',
          message: 'Your account has been set up successfully'
        });
        localStorage.setItem('habit-tks-setup', 'completed');
        onSetupComplete();
      } else {
        throw new Error('Failed to setup account');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
      showToast({
        type: 'error',
        title: 'Setup Failed',
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mx-auto mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Habit TKS</h1>
          <p className="text-lg text-gray-600">
            Your journey to building unstoppable habits starts here
          </p>
        </div>

        {/* Setup Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                placeholder="Enter your email address"
              />
            </div>



            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" variant="white" />
                  <span>Setting up...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Start My Journey</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Features Preview */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Baseline Habits</h3>
            <p className="text-sm text-gray-600">
              Start with 4 simple, daily habits that build your foundation
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Progressive Tiers</h3>
            <p className="text-sm text-gray-600">
              Unlock more challenging habits as you build consistency
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 text-center shadow-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Tracking</h3>
            <p className="text-sm text-gray-600">
              Monitor progress and streaks with detailed analytics
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            By continuing, you agree to our terms of service and privacy policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Setup;
