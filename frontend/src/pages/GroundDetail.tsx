import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGroundDetail, useAddGroundReview } from '../hooks/useGrounds';
import { useAuth } from '../providers/AuthProvider';
import { Loader2, ArrowLeft, MapPin, Phone, IndianRupee, Star, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const GroundDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: ground, isLoading } = useGroundDetail(id!);
  const addReview = useAddGroundReview();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-green-600" /></div>;
  if (!ground) return <div className="text-center py-20">Venue not found</div>;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addReview.mutate({ id: ground.id, rating, comment }, {
      onSuccess: () => setComment('')
    });
  };

  const hasReviewed = ground.reviews?.some((r: any) => r.userId === user?.id);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <button onClick={() => navigate('/grounds')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-5 h-5" /> Back to Venues
      </button>

      {ground.status === 'PENDING' && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-xl mb-6 font-medium">
          This ground is pending admin verification and is not publicly visible yet.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Gallery & Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Gallery */}
          <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-video relative">
            {ground.photos?.length > 0 ? (
              <>
                <img src={ground.photos[activeImage]} className="w-full h-full object-cover" />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {ground.photos.map((_: any, i: number) => (
                    <button key={i} onClick={() => setActiveImage(i)} className={`w-2 h-2 rounded-full ${i === activeImage ? 'bg-white' : 'bg-white/50'}`} />
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No photos available</div>
            )}
          </div>

          <div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  {ground.name}
                  {ground.status === 'VERIFIED' && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                </h1>
                <div className="flex items-center gap-2 mt-2 text-gray-500">
                  <MapPin className="w-5 h-5" /> {ground.location}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-yellow-500 mb-1">
                  <Star className="w-6 h-6 fill-current" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{ground.avgRating > 0 ? ground.avgRating : 'New'}</span>
                </div>
                <span className="text-gray-500">{ground._count.reviews} reviews</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              {ground.sports?.map((s: string) => (
                <span key={s} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">{s}</span>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Amenities</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                {ground.amenities?.length > 0 ? ground.amenities.map((a: string) => <li key={a}>• {a}</li>) : <li>None listed</li>}
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-lg mb-4">Pricing & Contact</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <IndianRupee className="w-5 h-5" /> {ground.pricing || 'Contact for pricing'}
                </div>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <Phone className="w-5 h-5" /> {ground.contactPhone || 'No contact provided'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Reviews */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-xl mb-6">Reviews</h3>
            
            {ground.aiSummary && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 p-4 rounded-xl mb-8">
                <div className="flex items-center gap-2 text-purple-700 font-bold mb-2">
                  <Star className="w-5 h-5 fill-current" />
                  AI Summary
                </div>
                <p className="text-sm text-purple-900 leading-relaxed">
                  {ground.aiSummary}
                </p>
              </div>
            )}
            
            {user && (
              <form onSubmit={handleReviewSubmit} className="mb-8 border-b pb-8">
                <h4 className="font-medium mb-3">{hasReviewed ? 'Update your review' : 'Write a review'}</h4>
                <div className="flex gap-2 mb-3">
                  {[1,2,3,4,5].map(star => (
                    <button type="button" key={star} onClick={() => setRating(star)}>
                      <Star className={`w-6 h-6 ${rating >= star ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 rounded-lg p-3 text-sm resize-none mb-3"
                  rows={3}
                  placeholder="Share your experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button type="submit" disabled={addReview.isPending} className="w-full bg-gray-900 text-white font-medium py-2 rounded-lg hover:bg-gray-800">
                  {addReview.isPending ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}

            <div className="space-y-6">
              {ground.reviews?.length > 0 ? (
                ground.reviews.map((r: any) => (
                  <div key={r.id}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <img src={r.user.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${r.user.name}`} className="w-8 h-8 rounded-full" />
                        <div>
                          <p className="font-medium text-sm">{r.user.name}</p>
                          <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(r.createdAt))} ago</p>
                        </div>
                      </div>
                      <div className="flex items-center text-yellow-500 text-sm font-medium">
                        <Star className="w-4 h-4 fill-current mr-1" /> {r.rating}
                      </div>
                    </div>
                    {r.comment && <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">{r.comment}</p>}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No reviews yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
