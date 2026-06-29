import { Request, Response } from 'express';
import { cloudinary } from '../utils/cloudinary';
import fs from 'fs';

export class UploadController {
  async uploadImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      // Upload to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'playgrid',
        use_filename: true,
      });

      // Remove temp file from local server
      fs.unlinkSync(req.file.path);

      res.status(200).json({
        url: result.secure_url,
        public_id: result.public_id,
      });
    } catch (error: any) {
      console.error('Upload Error:', error);
      res.status(500).json({ error: 'Image upload failed' });
    }
  }
}

export const uploadController = new UploadController();
