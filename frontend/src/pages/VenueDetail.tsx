import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVenueDetail, useAddVenueReview } from '../hooks/useVenues';
import { useAuth } from '../providers/AuthProvider';
import { ArrowLeft, MapPin, Phone, Mail, Globe, IndianRupee, Star, CheckCircle2, CheckCircle, Image as ImageIcon, Navigation, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '../components/Skeleton';
import { UserLink } from '../components/ui/UserLink';

export const VenueDetail = () => {
 const { id } = useParams();
 const navigate = useNavigate();
 const { user } = useAuth();
 const { data: venue, isLoading } = useVenueDetail(id!);
 const addReview = useAddVenueReview();

 const [rating, setRating] = useState(5);
 const [comment, setComment] = useState('');
 const [activeImage, setActiveImage] = useState(0);

 if (isLoading) return (
 <div className="max-w-6xl mx-auto py-10 px-4 space-y-6">
 <Skeleton className="h-8 w-24 mb-6" />
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <div className="lg:col-span-2 space-y-8">
 <Skeleton className="w-full aspect-video rounded-2xl" />
 <Skeleton className="h-32 w-full card-premium" />
 </div>
 <Skeleton className="h-96 w-full card-premium" />
 </div>
 </div>
 );
 if (!venue) return <div className="text-center py-20 font-bold text-muted text-sm">Venue not found</div>;

 const handleReviewSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 addReview.mutate({ id: venue.id, rating, comment }, {
 onSuccess: () => setComment('')
 });
 };

 const hasReviewed = venue.reviews?.some((r: any) => r.userId === user?.id);

 const getSportBadgeClass = (sport: string) => {
 const s = sport.toLowerCase();
 if (s.includes('cricket')) return 'badge-cricket';
 if (s.includes('football') || s.includes('soccer')) return 'badge-football';
 if (s.includes('badminton')) return 'badge-badminton';
 if (s.includes('tennis')) return 'badge-tennis';
 if (s.includes('pickleball')) return 'badge-pickleball';
 if (s.includes('basketball')) return 'badge-basketball';
 return 'bg-zinc-100 text-zinc-700 ';
 };

 return (
 <div className="max-w-6xl mx-auto py-10 px-4">
 <button onClick={() => navigate('/venues')} className="flex items-center gap-2 text-muted hover:text-foreground mb-8 font-semibold text-sm transition-colors cursor-pointer">
 <ArrowLeft className="w-4 h-4" /> Back to Venues
 </button>

 {venue.status === 'PENDING' && (
 <div className="bg-yellow-50 text-yellow-800 border border-yellow-200 p-4 rounded-xl mb-8 font-bold flex items-center gap-3 text-xs">
 This venue is pending admin verification and is not publicly visible yet.
 </div>
 )}

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Left Col: Gallery & Info */}
 <div className="lg:col-span-2 space-y-8">
 {/* Gallery */}
 <div className="bg-surface border border-border rounded-2xl overflow-hidden aspect-video relative shadow-sm group">
 {venue.photos?.length > 0 ? (
 <>
 <img src={venue.photos[activeImage]} alt={venue.name} className="w-full h-full object-cover transition-transform duration-75 group-hover:scale-105" />
 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
 {venue.photos.map((_: any, i: number) => (
 <button key={i} onClick={() => setActiveImage(i)} aria-label={`View photo ${i + 1}`} className={`w-2.5 h-2.5 rounded-full transition-all ${i === activeImage ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`} />
 ))}
 </div>
 </>
 ) : (
 <div className="w-full h-full flex flex-col items-center justify-center text-muted gap-2">
 <ImageIcon className="w-12 h-12 opacity-50" />
 <span className="font-semibold text-sm">No photos available</span>
 </div>
 )}
 </div>

 <div>
 <div className="flex items-start justify-between">
 <div>
 <h1 className="text-2xl md:text-3xl font-black text-foreground flex items-center gap-3 leading-tight">
 {venue.name}
 {venue.status === 'VERIFIED' && <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />}
 </h1>
 <div className="flex items-center gap-2 mt-3 text-muted font-bold text-sm">
 <MapPin className="w-4 h-4 shrink-0" /> 
 <span>
   {venue.formattedAddress || venue.location}
   {venue.city && `, ${venue.city}`}
 </span>
 </div>

 {(venue.googleMapsUrl || (venue.latitude && venue.longitude)) && (
   <a 
     href={venue.googleMapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`} 
     target="_blank" 
     rel="noreferrer"
     className="inline-flex items-center gap-2 mt-4 text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100"
   >
     <Navigation className="w-4 h-4" />
     Get Directions
   </a>
 )}
 </div>
 <div className="text-right shrink-0 bg-surface border border-border px-4 py-2 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
 <div className="flex items-center justify-end gap-1.5 text-amber-500 mb-1">
 <Star className="w-5 h-5 fill-current" />
 <span className="text-2xl font-black text-foreground">{venue.avgRating > 0 ? venue.avgRating : 'New'}</span>
 </div>
 <span className="text-muted text-[10px] font-bold uppercase tracking-wider">{venue._count.reviews} reviews</span>
 </div>
 </div>

 <div className="flex flex-wrap gap-2 mt-6">
 {venue.sports?.map((s: string) => (
 <span key={s} className={`badge-premium ${getSportBadgeClass(s)}`}>{s}</span>
 ))}
 </div>

 {venue.description && (
    <div className="mt-8">
      <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-foreground"><Info className="w-4 h-4 text-indigo-500" /> About this Venue</h3>
      <p className="text-muted text-sm leading-relaxed whitespace-pre-wrap bg-surface p-5 rounded-2xl border border-border">
        {venue.description}
      </p>
    </div>
 )}
 </div>

 <div className="grid sm:grid-cols-2 gap-6">
 <div className="card-premium p-6 bg-surface">
 <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-foreground"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Amenities</h3>
 <ul className="space-y-3 text-muted text-xs font-semibold">
 {venue.amenities?.length > 0 ? venue.amenities.map((a: string) => (
 <li key={a} className="flex items-center gap-2">
 <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" /> {a}
 </li>
 )) : <li>None listed</li>}
 </ul>
 </div>
 
 <div className="card-premium p-6 bg-surface">
 <h3 className="font-bold text-sm mb-4 text-foreground">Pricing & Contact</h3>
 <div className="space-y-4">
 <div className="flex items-center gap-4 text-foreground font-semibold">
 <div className="p-2.5 bg-zinc-50 border border-border rounded-xl"><IndianRupee className="w-4 h-4 text-muted" /></div>
 <span className="text-base font-bold">{venue.pricing || 'Contact for pricing'}</span>
 </div>
 <div className="flex items-center gap-4 text-muted font-medium text-sm">
 <div className="p-2.5 bg-zinc-50 border border-border rounded-xl"><Phone className="w-4 h-4" /></div>
 <span>{venue.contactPhone || 'N/A'}</span>
 </div>
 {venue.contactEmail && (
 <div className="flex items-center gap-4 text-muted font-medium text-sm hover:text-indigo-600 transition-colors">
 <div className="p-2.5 bg-zinc-50 border border-border rounded-xl"><Mail className="w-4 h-4" /></div>
 <a href={`mailto:${venue.contactEmail}`}>{venue.contactEmail}</a>
 </div>
 )}
 {venue.website && (
 <div className="flex items-center gap-4 text-muted font-medium text-sm hover:text-indigo-600 transition-colors">
 <div className="p-2.5 bg-zinc-50 border border-border rounded-xl"><Globe className="w-4 h-4" /></div>
 <a href={venue.website} target="_blank" rel="noreferrer">{new URL(venue.website).hostname.replace('www.', '')}</a>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 
 {/* Upcoming Matches */}
 {venue.matches && venue.matches.length > 0 && (
 <div className="mt-8 pt-8 border-t border-border">
 <h3 className="font-bold text-sm mb-4 text-foreground">Upcoming Matches</h3>
 <div className="grid sm:grid-cols-2 gap-4">
 {venue.matches.map((m: any) => (
 <div key={m.id} className="bg-surface border border-border p-4 rounded-xl flex items-center justify-between group hover:border-indigo-200 transition-colors cursor-pointer" onClick={() => navigate(`/matches/${m.id}`)}>
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getSportBadgeClass(m.sport)}`}>{m.sport}</span>
 <span className="text-xs font-semibold text-muted">{new Date(m.date).toLocaleDateString()}</span>
 </div>
 <h4 className="font-bold text-foreground text-sm group-hover:text-indigo-600 transition-colors truncate max-w-[150px]">{m.title}</h4>
 </div>
 <div className="text-right shrink-0">
 <p className="text-xs font-bold text-muted mb-1">{m._count?.players || 0} / {m.maxPlayers || 0} Players</p>
 <span className="text-indigo-600 font-bold text-xs group-hover:underline">View</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 
 </div>

 {/* Right Col: Reviews */}
 <div className="space-y-6">
 <div className="card-premium p-6 md:p-8 bg-surface">
 <h3 className="font-bold text-base mb-6 text-foreground">Reviews</h3>
 
 {venue.aiSummary && (
 <div className="bg-zinc-50 border border-border p-5 rounded-2xl mb-8 relative overflow-hidden">
 <div className="flex items-center gap-2 text-zinc-950 font-extrabold tracking-wider uppercase text-[10px] mb-3">
 <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
 AI Summary
 </div>
 <p className="text-xs text-muted leading-relaxed font-semibold">
 {venue.aiSummary}
 </p>
 </div>
 )}
 
 {user && (
 <form onSubmit={handleReviewSubmit} className="mb-8 border-b border-border pb-8">
 <h4 className="font-bold text-foreground text-xs mb-4">{hasReviewed ? 'Update your review' : 'Write a review'}</h4>
 <div className="flex gap-2 mb-4">
 {[1,2,3,4,5].map(star => (
 <button type="button" key={star} onClick={() => setRating(star)} aria-label={`Rate ${star} stars`} className="focus:outline-none transition-transform hover:scale-110 cursor-pointer">
 <Star className={`w-6 h-6 ${rating >= star ? 'fill-amber-500 text-amber-500' : 'text-muted/30'}`} />
 </button>
 ))}
 </div>
 <textarea
 className="w-full bg-surface border border-border rounded-xl p-4 text-sm text-foreground resize-none mb-4 focus:outline-none focus:ring-1 focus:ring-zinc-950 transition-all"
 rows={3}
 placeholder="Share your experience..."
 value={comment}
 onChange={(e) => setComment(e.target.value)}
 />
 <button type="submit" disabled={addReview.isPending} className="w-full btn-primary text-xs py-3">
 {addReview.isPending ? 'Submitting...' : 'Submit Review'}
 </button>
 </form>
 )}

 <div className="space-y-6">
 {venue.reviews?.length > 0 ? (
 venue.reviews.map((r: any) => (
 <div key={r.id} className="group">
 <div className="flex justify-between items-start mb-3">
 <div className="flex items-center gap-3">
 <UserLink userId={r.userId}>
   <img src={r.user.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${r.user.name}&background=random`} alt={r.user.name} className="w-8 h-8 rounded-full border border-border" />
 </UserLink>
 <div>
   <UserLink userId={r.userId}>
     <p className="font-bold text-foreground text-xs hover:underline">{r.user.name}</p>
   </UserLink>
   <p className="text-[10px] font-bold text-muted">{formatDistanceToNow(new Date(r.createdAt))} ago</p>
 </div>
 </div>
 <div className="flex items-center text-amber-500 text-xs font-bold bg-amber-50 px-2 py-1 rounded">
 <Star className="w-3.5 h-3.5 fill-current mr-1 text-amber-500" /> {r.rating}
 </div>
 </div>
 {r.comment && <p className="text-muted text-xs leading-relaxed mt-2 bg-zinc-50 p-4 rounded-xl border border-border">{r.comment}</p>}
 </div>
 ))
 ) : (
 <div className="text-center py-8">
 <p className="text-muted text-xs font-semibold">No reviews yet.</p>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 );
};
