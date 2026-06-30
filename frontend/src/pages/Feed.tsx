import React, { useEffect } from 'react';
import { useFeed } from '../hooks/usePosts';
import { PostCard } from '../components/PostCard';
import { CreatePostForm } from '../components/CreatePostForm';
import { PostSkeleton } from '../components/Skeleton';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { motion } from 'framer-motion';

export const Feed = () => {
  const { user } = useAuth();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useFeed();

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 w-full">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-black tracking-tight text-foreground">Community Feed</h1>
        <p className="text-muted mt-1">See what players are talking about in your area.</p>
      </motion.div>

      {user && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <CreatePostForm />
        </motion.div>
      )}

      <div className="space-y-4">
        {status === 'pending' ? (
          <div className="py-4 space-y-4">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : status === 'error' ? (
          <div className="text-center p-8 bg-red-50 dark:bg-red-900/10 rounded-xl text-red-500">
            Error loading feed. Please try again.
          </div>
        ) : (
          <>
            {data.pages.map((page, i) => (
              <React.Fragment key={i}>
                {page.posts.map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </React.Fragment>
            ))}
            
            <div ref={ref} className="py-8 flex justify-center">
              {isFetchingNextPage ? (
                <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              ) : hasNextPage ? (
                <span className="text-sm font-medium text-muted">Scroll for more</span>
              ) : (
                <span className="text-sm font-medium text-muted bg-surface px-4 py-2 rounded-full border border-border">You've caught up! 🎉</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
