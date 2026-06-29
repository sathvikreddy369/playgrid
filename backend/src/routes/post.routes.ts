import { Router } from 'express';
import { postController } from '../controllers/post.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { postLimiter, apiLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Publicly readable or require auth? Let's say feed is public but actions require auth.
// Actually, let's allow optionally authenticated reads to get "liked" status.
// We can use a loose auth middleware for GET, but for now we'll just use standard requireAuth since it's a social app.
// Or we can just let `req.user` be populated if token exists in a custom middleware.
// For simplicity, let's requireAuth for everything right now, or just make GET public and check req headers if we want.
// Let's assume you must be logged in to see the feed for now.

router.get('/', requireAuth, apiLimiter, postController.getPosts);
router.get('/:id', requireAuth, apiLimiter, postController.getPostById);

// Write actions require strict rate limiting
router.post('/', requireAuth, postLimiter, postController.createPost);
router.put('/:id', requireAuth, postLimiter, postController.updatePost);
router.delete('/:id', requireAuth, apiLimiter, postController.deletePost);

router.post('/:id/like', requireAuth, apiLimiter, postController.toggleLike);
router.post('/:id/save', requireAuth, apiLimiter, postController.toggleSave);

// Replies
router.post('/:id/replies', requireAuth, postLimiter, postController.createReply);
router.post('/replies/:id/like', requireAuth, apiLimiter, postController.toggleReplyLike);
router.delete('/replies/:id', requireAuth, apiLimiter, postController.deleteReply);

export default router;
