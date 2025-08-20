import React, { useState } from 'react';
import { Habit } from '../types/habit';
import { useHabits } from '../contexts/HabitContext';
import { CheckCircle, XCircle, Clock, Target, SkipForward } from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit }) => {
  const { completeHabit, skipHabit } = useHabits();
  const [isLoading, setIsLoading] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [skipReason, setSkipReason] = useState('');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fitness':
        return '💪';
      case 'work':
        return '💼';
      case 'learning':
        return '📚';
      case 'productivity':
        return '⚡';
      default:
        return '🎯';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'baseline':
        return 'bg-blue-100 text-blue-800';
      case 'tier2':
        return 'bg-green-100 text-green-800';
      case 'tier3':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await completeHabit(habit.id, {});
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!skipReason.trim()) return;
    
    setIsLoading(true);
    try {
      await skipHabit(habit.id, { reason: skipReason });
      setShowSkipModal(false);
      setSkipReason('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="habit-card">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getCategoryIcon(habit.category)}</span>
            <div>
              <h3 className="font-semibold text-gray-900">{habit.name}</h3>
              <p className="text-sm text-gray-600">{habit.description}</p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <span className={`tier-badge ${getTierColor(habit.tier)}`}>
              {habit.tier === 'baseline' ? 'Baseline' : `Tier ${habit.tier.slice(-1)}`}
            </span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(habit.priority)}`}>
              {habit.priority.charAt(0).toUpperCase() + habit.priority.slice(1)} Priority
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{habit.frequency}</span>
            </div>
            {habit.reminderTime && (
              <div className="flex items-center space-x-1">
                <Target className="w-4 h-4" />
                <span>{habit.reminderTime}</span>
              </div>
            )}
          </div>
          
          {habit.notes && (
            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              💡 {habit.notes}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={handleComplete}
            disabled={isLoading}
            className="flex-1 btn-success flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Complete</span>
          </button>
          
          {habit.skipAllowed && (
            <button
              onClick={() => setShowSkipModal(true)}
              disabled={isLoading}
              className="btn-warning flex items-center justify-center space-x-2 px-3"
            >
              <SkipForward className="w-4 h-4" />
              <span>Skip</span>
            </button>
          )}
        </div>

        {/* Streak Info */}
        {habit.streakTracking && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Current Streak</span>
              <span className="font-medium text-gray-900">
                {/* Mock streak - in real app, this would come from analytics */}
                {Math.floor(Math.random() * 30) + 1} days
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Skip Modal */}
      {showSkipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Skip "{habit.name}"
            </h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for skipping this habit. This helps track patterns and improve your habit-building strategy.
            </p>
            
            <textarea
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
              placeholder="e.g., Feeling unwell, traveling, emergency..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
              rows={3}
            />
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSkipModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSkip}
                disabled={!skipReason.trim() || isLoading}
                className="btn-warning flex-1"
              >
                {isLoading ? 'Skipping...' : 'Skip Habit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HabitCard;
