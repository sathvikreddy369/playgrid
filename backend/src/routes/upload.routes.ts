import { Router } from 'express';
import multer from 'multer';
import { uploadController } from '../controllers/upload.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Configure multer for temp local storage before uploading to Cloudinary
const upload = multer({ dest: 'uploads/' });

// Protected upload route
router.post('/image', requireAuth, upload.single('image'), uploadController.uploadImage);

export default router;
