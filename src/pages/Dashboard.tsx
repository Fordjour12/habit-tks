import React, { useEffect } from 'react';
import { useHabits } from '../contexts/HabitContext';
import { useUser } from '../contexts/UserContext';
import { Target, TrendingUp, Calendar, Award } from 'lucide-react';
import HabitCard from '../components/HabitCard';

const Dashboard: React.FC = () => {
  const { state: habitState, fetchHabits } = useHabits();
  const { state: userState } = useUser();

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const activeHabits = habitState.habits.filter(habit => habit.isActive && !habit.archived);
  const baselineHabits = activeHabits.filter(habit => habit.tier === 'baseline');
  const tier2Habits = activeHabits.filter(habit => habit.tier === 'tier2');
  const tier3Habits = activeHabits.filter(habit => habit.tier === 'tier3');

  const getTierProgress = (tier: string) => {
    const tierHabits = activeHabits.filter(habit => habit.tier === tier);
    if (tierHabits.length === 0) return 0;
    
    // Mock completion rate - in real app, this would come from analytics
    return Math.floor(Math.random() * 40) + 60; // 60-99%
  };

  const getTierUnlockDate = (tier: string) => {
    if (tier === 'tier2') {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {userState.user?.name || 'Habit Builder'}! 🚀
        </h1>
        <p className="text-primary-100 text-lg">
          Keep building momentum with your {activeHabits.length} active habits
        </p>
        <div className="flex items-center space-x-6 mt-6">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span className="text-sm">Current Tier: {userState.user?.currentTier || 'Baseline'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm">{userState.user?.streak || 0} Day Streak</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Habits</p>
              <p className="text-2xl font-bold text-gray-900">{activeHabits.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Today's Progress</p>
              <p className="text-2xl font-bold text-gray-900">{getTierProgress('baseline')}%</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Streak</p>
              <p className="text-2xl font-bold text-gray-900">{userState.user?.streak || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Next Milestone</p>
              <p className="text-2xl font-bold text-gray-900">Tier 2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Baseline Habits */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Today's Baseline Habits</h2>
          <span className="text-sm text-gray-500">
            {baselineHabits.length} of 4 habits active
          </span>
        </div>
        
        {habitState.loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="habit-card animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {baselineHabits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </div>
        )}
      </div>

      {/* Tier Progression */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Tier 2 Preview */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tier 2 Habits</h3>
            <span className="tier-badge tier-tier2">Locked</span>
          </div>
          <p className="text-gray-600 mb-4">
            Unlock more challenging habits by maintaining your baseline for 7 consecutive days.
          </p>
          <div className="bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }}></div>
          </div>
          <p className="text-sm text-gray-500">
            Unlocks in {getTierUnlockDate('tier2')}
          </p>
        </div>

        {/* Tier 3 Preview */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tier 3 Habits</h3>
            <span className="tier-badge tier-tier3">Locked</span>
          </div>
          <p className="text-gray-600 mb-4">
            Advanced habits for when you're ready to push your limits and achieve peak performance.
          </p>
          <div className="bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '0%' }}></div>
          </div>
          <p className="text-sm text-gray-500">
            Complete Tier 2 first to unlock
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary">
            <Target className="w-4 h-4 mr-2" />
            Add Custom Habit
          </button>
          <button className="btn-secondary">
            <TrendingUp className="w-4 h-4 mr-2" />
            View Analytics
          </button>
          <button className="btn-secondary">
            <Calendar className="w-4 h-4 mr-2" />
            Set Reminders
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
