import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGroundDetail, useAddGroundReview } from '../hooks/useGrounds';
import { useAuth } from '../providers/AuthProvider';
import { ArrowLeft, MapPin, Phone, IndianRupee, Star, CheckCircle2, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '../components/Skeleton';

export const GroundDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: ground, isLoading } = useGroundDetail(id!);
  const addReview = useAddGroundReview();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      <Skeleton className="h-8 w-24 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="w-full aspect-video rounded-2xl" />
          <Skeleton className="h-32 w-full card" />
        </div>
        <Skeleton className="h-96 w-full card" />
      </div>
    </div>
  );
  if (!ground) return <div className="text-center py-20 font-medium text-muted">Venue not found</div>;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addReview.mutate({ id: ground.id, rating, comment }, {
      onSuccess: () => setComment('')
    });
  };

  const hasReviewed = ground.reviews?.some((r: any) => r.userId === user?.id);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <button onClick={() => navigate('/grounds')} className="flex items-center gap-2 text-muted hover:text-foreground mb-6 font-medium transition-colors">
        <ArrowLeft className="w-5 h-5" /> Back to Venues
      </button>

      {ground.status === 'PENDING' && (
        <div className="bg-yellow-50 text-yellow-800 border border-yellow-200 p-4 rounded-xl mb-8 font-bold flex items-center gap-3">
          This ground is pending admin verification and is not publicly visible yet.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Gallery & Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Gallery */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden aspect-video relative shadow-sm group">
            {ground.photos?.length > 0 ? (
              <>
                <img src={ground.photos[activeImage]} alt={ground.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {ground.photos.map((_: any, i: number) => (
                    <button key={i} onClick={() => setActiveImage(i)} aria-label={`View photo ${i + 1}`} className={`w-2.5 h-2.5 rounded-full transition-all ${i === activeImage ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`} />
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted gap-2">
                <ImageIcon className="w-12 h-12 opacity-50" />
                <span className="font-medium text-lg">No photos available</span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-foreground flex items-center gap-3 leading-tight">
                  {ground.name}
                  {ground.status === 'VERIFIED' && <CheckCircle className="w-7 h-7 text-green-500 shrink-0" />}
                </h1>
                <div className="flex items-center gap-2 mt-3 text-muted font-medium text-lg">
                  <MapPin className="w-5 h-5 shrink-0" /> {ground.location}
                </div>
              </div>
              <div className="text-right shrink-0 bg-surface border border-border px-4 py-2 rounded-xl shadow-sm">
                <div className="flex items-center justify-end gap-1.5 text-yellow-500 mb-1">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-2xl font-black text-foreground">{ground.avgRating > 0 ? ground.avgRating : 'New'}</span>
                </div>
                <span className="text-muted text-sm font-bold uppercase tracking-wider">{ground._count.reviews} reviews</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              {ground.sports?.map((s: string) => (
                <span key={s} className="px-3 py-1 bg-surface border border-border text-foreground rounded-md text-xs font-bold uppercase tracking-wider">{s}</span>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-black text-lg mb-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Amenities</h3>
              <ul className="space-y-3 text-muted font-medium">
                {ground.amenities?.length > 0 ? ground.amenities.map((a: string) => (
                  <li key={a} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted" /> {a}
                  </li>
                )) : <li>None listed</li>}
              </ul>
            </div>
            
            <div className="card p-6">
              <h3 className="font-black text-lg mb-4">Pricing & Contact</h3>
              <div className="space-y-5">
                <div className="flex items-center gap-4 text-foreground font-medium">
                  <div className="p-2.5 bg-surface border border-border rounded-xl"><IndianRupee className="w-5 h-5 text-muted" /></div>
                  <span className="text-lg font-bold">{ground.pricing || 'Contact for pricing'}</span>
                </div>
                <div className="flex items-center gap-4 text-foreground font-medium">
                  <div className="p-2.5 bg-surface border border-border rounded-xl"><Phone className="w-5 h-5 text-muted" /></div>
                  <span className="text-lg">{ground.contactPhone || 'No contact provided'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Reviews */}
        <div className="space-y-6">
          <div className="card p-6 md:p-8">
            <h3 className="font-black text-xl mb-6">Reviews</h3>
            
            {ground.aiSummary && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border border-purple-200 dark:border-purple-800 p-5 rounded-2xl mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full -mr-4 -mt-4" />
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-black tracking-wider uppercase text-xs mb-3">
                  <Star className="w-4 h-4 fill-current" />
                  AI Summary
                </div>
                <p className="text-[15px] text-foreground leading-relaxed font-medium relative z-10">
                  {ground.aiSummary}
                </p>
              </div>
            )}
            
            {user && (
              <form onSubmit={handleReviewSubmit} className="mb-8 border-b border-border pb-8">
                <h4 className="font-bold text-foreground mb-4">{hasReviewed ? 'Update your review' : 'Write a review'}</h4>
                <div className="flex gap-2 mb-4">
                  {[1,2,3,4,5].map(star => (
                    <button type="button" key={star} onClick={() => setRating(star)} aria-label={`Rate ${star} stars`} className="focus:outline-none transition-transform hover:scale-110">
                      <Star className={`w-7 h-7 ${rating >= star ? 'fill-yellow-500 text-yellow-500' : 'text-muted/50'}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  className="w-full bg-surface border border-border rounded-xl p-4 text-[15px] text-foreground resize-none mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  rows={3}
                  placeholder="Share your experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button type="submit" disabled={addReview.isPending} className="w-full bg-foreground text-background font-bold py-3 rounded-xl hover:bg-foreground/90 transition-all active:scale-95 disabled:opacity-50 shadow-sm">
                  {addReview.isPending ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}

            <div className="space-y-6">
              {ground.reviews?.length > 0 ? (
                ground.reviews.map((r: any) => (
                  <div key={r.id} className="group">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <img src={r.user.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${r.user.name}`} alt={r.user.name} className="w-10 h-10 rounded-full bg-border" />
                        <div>
                          <p className="font-bold text-foreground text-[15px]">{r.user.name}</p>
                          <p className="text-[12px] font-medium text-muted">{formatDistanceToNow(new Date(r.createdAt))} ago</p>
                        </div>
                      </div>
                      <div className="flex items-center text-yellow-500 text-sm font-black bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded">
                        <Star className="w-3.5 h-3.5 fill-current mr-1" /> {r.rating}
                      </div>
                    </div>
                    {r.comment && <p className="text-foreground text-[15px] leading-relaxed mt-2 bg-surface/50 p-4 rounded-xl border border-border">{r.comment}</p>}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted font-medium">No reviews yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
