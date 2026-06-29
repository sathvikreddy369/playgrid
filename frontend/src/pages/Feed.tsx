import React, { useEffect } from 'react';
import { useFeed } from '../hooks/usePosts';
import { PostCard } from '../components/PostCard';
import { CreatePostForm } from '../components/CreatePostForm';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';

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
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Community Feed</h1>
        <p className="text-gray-500 dark:text-gray-400">See what players are talking about in your area.</p>
      </div>

      {user && <CreatePostForm />}

      <div className="space-y-4">
        {status === 'pending' ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : status === 'error' ? (
          <p className="text-center text-red-500">Error loading feed</p>
        ) : (
          <>
            {data.pages.map((page, i) => (
              <React.Fragment key={i}>
                {page.posts.map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </React.Fragment>
            ))}
            
            <div ref={ref} className="py-4 flex justify-center">
              {isFetchingNextPage ? (
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              ) : hasNextPage ? (
                <span className="text-sm text-gray-500">Scroll for more</span>
              ) : (
                <span className="text-sm text-gray-500">You've caught up!</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
