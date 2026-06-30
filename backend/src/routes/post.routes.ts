import { Router } from 'express';
import { postController } from '../controllers/post.controller';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware';
import { postLimiter, apiLimiter } from '../middlewares/rateLimiter';
import { validate } from '../middlewares/validate';
import { createPostSchema, updatePostSchema, createReplySchema } from '../validators';

const router = Router();

// Feed should be public, but optionally loaded with user
router.get('/', optionalAuth, apiLimiter, postController.getPosts);
router.get('/:id', optionalAuth, apiLimiter, postController.getPostById);

// Write actions require strict rate limiting
router.post('/', requireAuth, postLimiter, validate(createPostSchema), postController.createPost);
router.put('/:id', requireAuth, postLimiter, validate(updatePostSchema), postController.updatePost);
router.delete('/:id', requireAuth, apiLimiter, postController.deletePost);

router.post('/:id/like', requireAuth, apiLimiter, postController.toggleLike);
router.post('/:id/save', requireAuth, apiLimiter, postController.toggleSave);

// Replies
router.post('/:id/replies', requireAuth, postLimiter, validate(createReplySchema), postController.createReply);
router.post('/replies/:id/like', requireAuth, apiLimiter, postController.toggleReplyLike);
router.delete('/replies/:id', requireAuth, apiLimiter, postController.deleteReply);

export default router;
