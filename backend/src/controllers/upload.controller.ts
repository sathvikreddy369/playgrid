import { Request, Response, NextFunction } from 'express';
import { uploadToCloudinary } from '../utils/cloudinary';
import { AppError } from '../utils/AppError';

export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw AppError.badRequest('No file uploaded. Send a file with field name "image".');
    }

    // Validate file type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimes.includes(req.file.mimetype)) {
      throw AppError.badRequest('Invalid file type. Allowed: JPEG, PNG, WebP, GIF.');
    }

    const url = await uploadToCloudinary(req.file.buffer, 'playgrid');
    res.json({ url });
  } catch (error) {
    next(error);
  }
};
