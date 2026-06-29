"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadController = exports.UploadController = void 0;
const cloudinary_1 = require("../utils/cloudinary");
const fs_1 = __importDefault(require("fs"));
class UploadController {
    async uploadImage(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No image file provided' });
            }
            // Upload to cloudinary
            const result = await cloudinary_1.cloudinary.uploader.upload(req.file.path, {
                folder: 'playgrid',
                use_filename: true,
            });
            // Remove temp file from local server
            fs_1.default.unlinkSync(req.file.path);
            res.status(200).json({
                url: result.secure_url,
                public_id: result.public_id,
            });
        }
        catch (error) {
            console.error('Upload Error:', error);
            res.status(500).json({ error: 'Image upload failed' });
        }
    }
}
exports.UploadController = UploadController;
exports.uploadController = new UploadController();
//# sourceMappingURL=upload.controller.js.map