import React, { useState } from 'react';
import { useCreateCommunity } from '../hooks/useCommunities';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const CreateCommunity = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();
  const createCommunity = useCreateCommunity();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    createCommunity.mutate(
      { name, description, location },
      {
        onSuccess: () => {
          alert('Community created and is now pending admin verification.');
          navigate('/communities');
        },
        onError: (err: any) => {
          alert(err.response?.data?.error || 'Failed to create community');
        }
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Start a Community</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Build a space for your local players to gather, discuss, and play.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Community Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. Bangalore Weekend Footballers"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              placeholder="What is this community about?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location (Optional)</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. Koramangala, Bangalore"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
            <button
              type="submit"
              disabled={createCommunity.isPending || !name.trim() || !description.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {createCommunity.isPending ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
