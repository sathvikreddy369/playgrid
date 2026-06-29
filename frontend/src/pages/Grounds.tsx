import React from 'react';
import { useGrounds } from '../hooks/useGrounds';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, MapPin, Star } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';

export const Grounds = () => {
  const { data: grounds, isLoading } = useGrounds('VERIFIED');
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sports Grounds</h1>
          <p className="text-gray-500 dark:text-gray-400">Discover top-rated sports venues near you.</p>
        </div>
        {user && (user.role === 'ORGANIZER' || user.role === 'ADMIN') && (
          <button 
            onClick={() => navigate('/grounds/create')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium transition-colors"
          >
            List Your Ground
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-green-600" />
        </div>
      ) : grounds?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grounds.map((ground: any) => (
            <Link 
              key={ground.id} 
              to={`/grounds/${ground.id}`}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md hover:border-green-500 transition-all group block"
            >
              <div className="h-48 bg-gray-200 overflow-hidden relative">
                {ground.photos?.[0] ? (
                  <img src={ground.photos[0]} alt={ground.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
                {ground.pricing && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold text-gray-900 shadow-sm">
                    {ground.pricing}
                  </div>
                )}
              </div>
              
              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{ground.name}</h3>
                <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-3">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{ground.location}</span>
                </div>
                
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {ground.sports?.slice(0, 3).map((sport: string) => (
                    <span key={sport} className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                      {sport}
                    </span>
                  ))}
                  {ground.sports?.length > 3 && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                      +{ground.sports.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                   <div className="flex items-center gap-1 text-yellow-500">
                     <Star className="w-4 h-4 fill-current" />
                     <span className="font-medium text-gray-900 dark:text-gray-100">
                       {ground._count.reviews > 0 ? 'Rated' : 'New'}
                     </span>
                     <span className="text-gray-400 text-sm">({ground._count.reviews})</span>
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">No venues found</h3>
          <p className="text-gray-500 mt-2">Check back later for new ground listings.</p>
        </div>
      )}
    </div>
  );
};
