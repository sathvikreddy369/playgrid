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
  fileFilter: (req, file, cb) => {
    // Restrict strictly to images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

router.post('/', requireAuth, upload.single('image'), uploadImage);

export default router;
