import React, { useState, useEffect } from 'react';
import { LightbulbIcon, CheckCircle, XCircle, Loader, ArrowRight } from 'lucide-react';
import RecommendationsAPI, { Recommendation } from '../lib/recommendationsApi';

const RecommendationsWidget = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await RecommendationsAPI.getRecommendations();
      setRecommendations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, status: 'completed' | 'dismissed') => {
    try {
      await RecommendationsAPI.updateRecommendationStatus(id, status);
      setRecommendations(prev => prev.filter(rec => rec.id !== id));
    } catch (err) {
      console.error('Failed to update recommendation:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-gray-800">
        <div className="flex items-center justify-center h-48">
          <Loader className="h-8 w-8 text-yellow-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">AI Recommendations</h2>
          <LightbulbIcon className="h-6 w-6 text-yellow-500" />
        </div>
        <div className="text-center text-red-500 dark:text-red-400 py-8">
          {error}
          <button
            onClick={fetchRecommendations}
            className="block mx-auto mt-2 text-blue-500 dark:text-blue-400 hover:underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">AI Recommendations</h2>
        <LightbulbIcon className="h-6 w-6 text-yellow-500" />
      </div>

      <div className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No active recommendations at this time
          </div>
        ) : (
          recommendations.map((rec) => (
            <div key={rec.id} className="border-l-4 border-l-green-500 pl-4 py-2 dark:border-l-green-600">
              <h3 className="font-medium text-gray-800 dark:text-white">{rec.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{rec.description}</p>
              <div className="flex items-center justify-between mt-2">
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${getPriorityColor(rec.priority)}`}>
                  {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(rec.id, 'completed')}
                    className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                    title="Mark as completed"
                  >
                    <CheckCircle className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleAction(rec.id, 'dismissed')}
                    className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    title="Dismiss"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={fetchRecommendations}
          className="flex items-center justify-center w-full py-2 text-sm text-yellow-600 hover:text-yellow-700 font-medium dark:text-yellow-400 dark:hover:text-yellow-300"
        >
          Refresh recommendations
          <ArrowRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default RecommendationsWidget;