import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middlewares/auth.middleware';
import { uploadImage } from '../controllers/upload.controller';

const router = Router();

// Configure multer for memory storage (buffer) with 5MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

router.post('/', requireAuth, upload.single('image'), uploadImage);

export default router;
