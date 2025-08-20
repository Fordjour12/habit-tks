import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, Target, Award } from 'lucide-react';

const Analytics: React.FC = () => {
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch weekly and monthly data
      const [weeklyResponse, monthlyResponse] = await Promise.all([
        fetch('/api/analytics/weekly'),
        fetch('/api/analytics/monthly')
      ]);

      if (weeklyResponse.ok) {
        const weekly = await weeklyResponse.json();
        setWeeklyData(weekly.data);
      }

      if (monthlyResponse.ok) {
        const monthly = await monthlyResponse.json();
        setMonthlyData(monthly.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDayColor = (completed: number, total: number) => {
    const percentage = (completed / total) * 100;
    if (percentage >= 80) return 'bg-success-500';
    if (percentage >= 60) return 'bg-warning-500';
    return 'bg-danger-500';
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Progress</h1>
        <p className="text-gray-600 mt-2">
          Track your habit-building journey with detailed insights and progress metrics
        </p>
      </div>

      {/* Weekly Progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Weekly Progress</h2>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success-500 rounded-full"></div>
              <span className="text-gray-600">80%+</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
              <span className="text-gray-600">60-79%</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-danger-500 rounded-full"></div>
              <span className="text-gray-600">&lt;60%</span>
            </div>
          </div>
        </div>

        {weeklyData && (
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2">
              {weeklyData.dailyProgress.map((day: any, index: number) => (
                <div key={index} className="text-center">
                  <div className="text-sm font-medium text-gray-700 mb-2">{day.day}</div>
                  <div className="relative">
                    <div className={`w-full h-24 rounded-lg ${getDayColor(day.completed, day.total)} flex items-center justify-center text-white font-bold text-lg`}>
                      {day.completed}/{day.total}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round((day.completed / day.total) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Week completion rate: <span className="font-semibold text-gray-900">{weeklyData.completionRate}%</span>
              </div>
              <div className="text-sm text-gray-600">
                Total habits: <span className="font-semibold text-gray-900">{weeklyData.totalHabits}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Monthly Summary */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Overview</h3>
          {monthlyData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{monthlyData.totalCompletions}</div>
                  <div className="text-sm text-gray-600">Total Completions</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{monthlyData.averageStreak}</div>
                  <div className="text-sm text-gray-600">Avg. Streak</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Best Day</span>
                  <span className="font-medium text-gray-900">{monthlyData.bestDay}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Worst Day</span>
                  <span className="font-medium text-gray-900">{monthlyData.worstDay}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
          {monthlyData && (
            <div className="space-y-3">
              {Object.entries(monthlyData.categoryBreakdown).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 capitalize">{category}</span>
                  </div>
                  <span className="font-medium text-gray-900">{count as number}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Streak Tracking */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Streaks</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-blue-900 mb-2">7</div>
            <div className="text-blue-700 font-medium">Days</div>
            <div className="text-sm text-blue-600">Current Streak</div>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-green-900 mb-2">21</div>
            <div className="text-green-700 font-medium">Days</div>
            <div className="text-sm text-green-600">Best Streak</div>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-purple-900 mb-2">85%</div>
            <div className="text-purple-700 font-medium">Success</div>
            <div className="text-sm text-purple-600">Rate</div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights & Recommendations</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">🎯 Strong Performance</h4>
            <p className="text-sm text-green-700">
              You're consistently completing your baseline habits. Consider unlocking Tier 2 habits soon!
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">📈 Trending Up</h4>
            <p className="text-sm text-blue-700">
              Your weekly completion rate has improved by 15% compared to last month.
            </p>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">⚠️ Room for Improvement</h4>
            <p className="text-sm text-yellow-700">
              Sunday completion rates are lower. Consider adjusting your routine for better consistency.
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-medium text-purple-800 mb-2">🚀 Next Milestone</h4>
            <p className="text-sm text-purple-700">
              You're 3 days away from unlocking Tier 2 habits. Keep up the momentum!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
