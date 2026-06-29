import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Reply as ReplyIcon } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { useCreateReply, useToggleLike } from '../hooks/usePosts';

const ReplyNode = ({ reply, postId, depth = 0 }: { reply: any; postId: string; depth?: number }) => {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [content, setContent] = useState('');
  
  const createReply = useCreateReply();
  const toggleLike = useToggleLike();

  const [isLiked, setIsLiked] = useState(reply.likes?.some((l: any) => l.userId === user?.id));
  const [likesCount, setLikesCount] = useState(reply._count?.likes || 0);

  const handleLike = () => {
    if (!user) return;
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    toggleLike.mutate({ postId: reply.id, isReply: true });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createReply.mutate({ postId, content, parentId: reply.id }, {
      onSuccess: () => {
        setContent('');
        setShowReplyForm(false);
      }
    });
  };

  return (
    <div className={`mt-4 ${depth > 0 ? 'ml-6 pl-4 border-l-2 border-gray-100 dark:border-gray-800' : ''}`}>
      <div className="flex items-start gap-3">
        <img 
          src={reply.author.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${reply.author.name}`} 
          alt={reply.author.name}
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{reply.author.name}</span>
            <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(reply.createdAt))} ago</span>
          </div>
          
          <p className="text-gray-800 dark:text-gray-200 mt-1 text-sm">{reply.content}</p>
          
          <div className="flex items-center gap-4 mt-2">
            <button onClick={handleLike} className={`flex items-center gap-1.5 text-xs font-medium ${isLiked ? 'text-pink-600' : 'text-gray-500 hover:text-pink-600'}`}>
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              {likesCount}
            </button>
            <button onClick={() => setShowReplyForm(!showReplyForm)} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-blue-600">
              <ReplyIcon className="w-4 h-4" />
              Reply
            </button>
          </div>

          {showReplyForm && user && (
            <form onSubmit={handleSubmit} className="mt-3 flex items-start gap-2">
              <input
                type="text"
                placeholder="Write a reply..."
                className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={!content.trim() || createReply.isPending}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Reply
              </button>
            </form>
          )}

          {/* Render Nested Replies */}
          {reply.children && reply.children.length > 0 && (
            <div className="mt-2">
              {reply.children.map((child: any) => (
                <ReplyNode key={child.id} reply={child} postId={postId} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ReplyTree = ({ replies, postId }: { replies: any[]; postId: string }) => {
  // Build a tree from flat replies array
  const buildTree = (flat: any[]) => {
    const rootNodes: any[] = [];
    const map = new Map();

    flat.forEach((node) => {
      map.set(node.id, { ...node, children: [] });
    });

    flat.forEach((node) => {
      const treeNode = map.get(node.id);
      if (node.parentId) {
        const parent = map.get(node.parentId);
        if (parent) {
          parent.children.push(treeNode);
        }
      } else {
        rootNodes.push(treeNode);
      }
    });

    return rootNodes;
  };

  const tree = buildTree(replies);

  return (
    <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-6">
      <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">Replies</h3>
      {tree.map(node => (
        <ReplyNode key={node.id} reply={node} postId={postId} />
      ))}
      {tree.length === 0 && (
        <p className="text-gray-500 text-center py-4">No replies yet. Be the first to start the conversation!</p>
      )}
    </div>
  );
};
