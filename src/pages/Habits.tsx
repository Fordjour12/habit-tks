import React, { useState, useEffect } from 'react';
import { useHabits } from '../contexts/HabitContext';
import { useUser } from '../contexts/UserContext';
import { Target, Plus, Filter, Search } from 'lucide-react';
import HabitCard from '../components/HabitCard';

const Habits: React.FC = () => {
  const { state: habitState, fetchHabits } = useHabits();
  const { state: userState } = useUser();
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const activeHabits = habitState.habits.filter(habit => habit.isActive && !habit.archived);
  
  const filteredHabits = activeHabits.filter(habit => {
    const matchesTier = selectedTier === 'all' || habit.tier === selectedTier;
    const matchesSearch = habit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         habit.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || habit.category === selectedCategory;
    
    return matchesTier && matchesSearch && matchesCategory;
  });

  const getTierStats = (tier: string) => {
    const tierHabits = activeHabits.filter(habit => habit.tier === tier);
    return {
      total: tierHabits.length,
      completed: Math.floor(Math.random() * tierHabits.length), // Mock data
      percentage: tierHabits.length > 0 ? Math.floor(Math.random() * 40) + 60 : 0
    };
  };

  const categories = ['all', 'fitness', 'work', 'learning', 'productivity'];
  const tiers = ['all', 'baseline', 'tier2', 'tier3'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Habits</h1>
          <p className="text-gray-600 mt-2">
            Manage and track your {activeHabits.length} active habits across all tiers
          </p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Habit
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        {tiers.filter(tier => tier !== 'all').map(tier => {
          const stats = getTierStats(tier);
          return (
            <div key={tier} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {tier === 'baseline' ? 'Baseline' : `Tier ${tier.slice(-1)}`}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary-600" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{stats.percentage}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search habits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tier Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {tiers.map(tier => (
                <option key={tier} value={tier}>
                  {tier === 'all' ? 'All Tiers' : 
                   tier === 'baseline' ? 'Baseline' : `Tier ${tier.slice(-1)}`}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : 
                   category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Habits List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {selectedTier === 'all' ? 'All Habits' : 
             selectedTier === 'baseline' ? 'Baseline Habits' : 
             `Tier ${selectedTier.slice(-1)} Habits`}
          </h2>
          <span className="text-sm text-gray-500">
            {filteredHabits.length} of {activeHabits.length} habits
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
        ) : filteredHabits.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No habits found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedTier !== 'all' || selectedCategory !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'You don\'t have any active habits yet. Start by adding your first habit!'}
            </p>
            <button className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Habit
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredHabits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Create Custom Habit
          </button>
          <button className="btn-secondary">
            <Target className="w-4 h-4 mr-2" />
            Import Habits
          </button>
          <button className="btn-secondary">
            <Filter className="w-4 h-4 mr-2" />
            Bulk Actions
          </button>
        </div>
      </div>
    </div>
  );
};

export default Habits;
