import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../providers/AuthProvider';
import { useFeed } from '../hooks/usePosts';
import { useMatches } from '../hooks/useMatches';
import { useCommunities } from '../hooks/useCommunities';
import { PostCard } from '../components/PostCard';
import { PostSkeleton } from '../components/Skeleton';
import { ArrowRight, Search, Users, Calendar, MapPin, Plus, Flame, Clock, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { format } from 'date-fns';
import { ActivityFeed } from '../components/ActivityFeed';

export const Home = () => {
  const { user } = useAuth();
  
  // Data Fetching
  const { data: feedData, isLoading: isLoadingFeed } = useFeed({});
  const { data: matchesData, isLoading: isLoadingMatches } = useMatches({ status: 'OPEN', limit: 5 });
  const { data: communitiesData, isLoading: isLoadingCommunities } = useCommunities({});

  const posts = feedData?.pages[0]?.posts?.slice(0, 3) || [];
  const matches = matchesData?.matches?.slice(0, 5) || [];
  const communities = communitiesData?.slice(0, 5) || [];

  const ActionCard = ({ to, icon: Icon, title, description, badge }: { to: string, icon: any, title: string, description: string, badge?: string }) => (
    <Link to={to} className="block">
      <Card className="group h-full flex flex-col p-5 hover:border-primary-300 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-6 h-6 stroke-[2px]" />
          </div>
          {badge && <Badge variant="success">{badge}</Badge>}
        </div>
        <div className="mt-auto">
          <h3 className="text-base font-bold text-foreground flex items-center gap-1 group-hover:text-primary-600 transition-colors">
            {title}
            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
          </h3>
          <p className="text-sm text-muted leading-snug mt-1">{description}</p>
        </div>
      </Card>
    </Link>
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 flex flex-col gap-10 pb-8">
      
      {/* Hero Header */}
      <div className="w-full pt-8 md:pt-12">
        {user ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-primary-600 font-bold mb-1 tracking-wide uppercase text-sm">Welcome back</p>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
                Ready to play, <span className="text-primary-600">{user.name?.split(' ')[0]}</span>?
              </h1>
            </div>
            <div className="flex gap-2">
              <Link to="/matches/create">
                <Button variant="primary" className="rounded-full">
                  <Plus className="w-4 h-4 mr-2" /> Host Match
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
            <Badge variant="default" className="mb-6 px-4 py-1.5 border-primary-200 bg-primary-50 text-primary-700">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              The Social Sports Network
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tight leading-[1.05] max-w-3xl mx-auto mb-6">
              Connect. Play. <br className="hidden md:block"/>
              <span className="text-primary-600">Compete.</span>
            </h1>
            <p className="text-lg text-muted max-w-xl mx-auto mb-8 leading-relaxed">
              Find local matches, join communities, and discover players who share your passion for sports.
            </p>
            <Link to="/login">
              <Button size="lg" className="rounded-full px-8">
                Join the Ecosystem <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        )}
      </div>

      {user && (
        <>
          {/* Quick Actions (Mobile Horizontal, Desktop Grid) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ActionCard to="/search" icon={Search} title="Find Players" description="Match by skill & location" />
            <ActionCard to="/matches" icon={Calendar} title="Matches" description="Join weekly games" badge="Live" />
            <ActionCard to="/communities" icon={Users} title="Clubs" description="Join local groups" />
            <ActionCard to="/venues" icon={MapPin} title="Venues" description="Book turfs & courts" />
          </div>

          <div className="grid md:grid-cols-12 gap-8 w-full mt-4">
            
            {/* Left Column (Main Feed & Matches) */}
            <div className="md:col-span-8 flex flex-col gap-10">
              
              {/* Upcoming Matches Horizontal Scroll */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" /> Upcoming Matches
                  </h2>
                  <Link to="/matches" className="text-sm font-bold text-primary-600 hover:text-primary-700">See all</Link>
                </div>
                
                {isLoadingMatches ? (
                  <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3].map(i => (
                      <Card key={i} className="min-w-[280px] w-[280px] md:w-[320px] h-[160px] p-5 bg-surface animate-pulse flex flex-col justify-between">
                        <div className="flex justify-between">
                          <div className="w-16 h-5 bg-zinc-200 rounded-full" />
                          <div className="w-10 h-4 bg-zinc-100 rounded" />
                        </div>
                        <div className="w-3/4 h-5 bg-zinc-200 rounded mt-2" />
                        <div className="w-1/2 h-4 bg-zinc-100 rounded mt-auto" />
                      </Card>
                    ))}
                  </div>
                ) : matches.length > 0 ? (
                  <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 gap-4 snap-x hide-scrollbar">
                    {matches.map((match: any) => (
                      <Link key={match.id} to={`/matches/${match.id}`} className="snap-start shrink-0 w-[280px] md:w-[320px]">
                        <Card className="p-4 h-full flex flex-col hover:border-primary-300 transition-colors">
                          <div className="flex justify-between items-start mb-3">
                            <Badge variant={match.sport.toLowerCase() as any} className="capitalize">
                              {match.sport.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs font-bold text-muted flex items-center gap-1">
                              <Users className="w-3 h-3" /> {match._count?.players || 0}/{match.maxPlayers}
                            </span>
                          </div>
                          <h3 className="font-bold text-base mb-1 truncate">{match.title}</h3>
                          <div className="text-sm text-muted flex items-center gap-1.5 mt-auto pt-4">
                            <Clock className="w-4 h-4" />
                            {format(new Date(match.date), 'MMM d, h:mm a')}
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-surface border border-border border-dashed rounded-2xl p-6">
                    <Calendar className="w-10 h-10 text-muted/60 mx-auto mb-3" />
                    <h3 className="font-bold text-foreground text-sm">No matches active</h3>
                    <p className="text-xs text-muted mt-1 mb-4">Be the first to list a match in your neighborhood!</p>
                    <Link to="/matches/create">
                      <Button variant="outline" size="sm" className="rounded-full">
                        <Plus className="w-4 h-4 mr-1.5" /> Host a Match
                      </Button>
                    </Link>
                  </div>
                )}
              </section>

              {/* Posts Snippet */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    Community Posts
                  </h2>
                </div>
                <div className="space-y-4">
                  {isLoadingFeed ? (
                    <PostSkeleton />
                  ) : posts.length > 0 ? (
                    posts.map((post: any) => (
                      <PostCard key={post.id} post={post} />
                    ))
                  ) : (
                    <div className="text-center py-12 bg-surface border border-border border-dashed rounded-2xl p-6">
                      <MessageSquare className="w-10 h-10 text-muted/60 mx-auto mb-3" />
                      <h3 className="font-bold text-foreground text-sm">No community posts yet</h3>
                      <p className="text-xs text-muted mt-1 mb-4">Start a conversation by posting updates, questions, or memes!</p>
                      <Link to="/feed">
                        <Button variant="outline" size="sm" className="rounded-full">
                          Go to Feed
                        </Button>
                      </Link>
                    </div>
                  )}
                  {posts.length > 0 && (
                    <Link to="/feed">
                      <Button variant="secondary" className="w-full mt-2">View Full Feed</Button>
                    </Link>
                  )}
                </div>
              </section>

            </div>

            {/* Right Column (Sidebar for Desktop) */}
            <div className="md:col-span-4 flex flex-col gap-8">
              
              {/* Trending Communities */}
              <section>
                <h2 className="text-lg font-bold mb-4">Trending Clubs</h2>
                <div className="flex flex-col gap-3">
                  {isLoadingCommunities ? (
                    Array(4).fill(0).map((_, i) => <Card key={i} className="h-16 animate-pulse bg-zinc-50" />)
                  ) : communities.length > 0 ? (
                    communities.map((community: any) => (
                      <Link key={community.id} to={`/communities/${community.id}`}>
                        <Card className="p-3 flex items-center gap-3 hover:bg-zinc-50 transition-colors">
                          <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xl uppercase">
                            {community.name.substring(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm truncate text-foreground">{community.name}</h4>
                            <p className="text-xs text-muted truncate">{community._count?.members || 0} members</p>
                          </div>
                        </Card>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-muted">No trending clubs.</p>
                  )}
                  <Link to="/communities">
                    <Button variant="ghost" className="w-full text-sm mt-1">Explore all clubs</Button>
                  </Link>
                </div>
              </section>

              {/* Friend Activity Feed */}
              <section>
                <h2 className="text-lg font-bold mb-4">Friend Activity</h2>
                <ActivityFeed userId={user.id} />
              </section>

            </div>
          </div>
        </>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};
