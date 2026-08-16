import { useState, useRef } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  maxImages?: number;
  currentImages?: string[];
}

export default function ImageUpload({ onUpload, maxImages = 1, currentImages = [] }: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(currentImages);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    if (images.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`);
      return;
    }

    setUploading(true);
    
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || cloudName === 'your-cloud-name') {
      // Simulate upload for dev without real credentials
      setTimeout(() => {
        const fakeUrl = URL.createObjectURL(files[0]);
        setImages(prev => [...prev, fakeUrl]);
        onUpload(fakeUrl);
        setUploading(false);
      }, 1000);
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);
      formData.append('upload_preset', uploadPreset);

      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.secure_url) {
          setImages(prev => [...prev, data.secure_url]);
          onUpload(data.secure_url);
        }
      } catch (err) {
        console.error('Error uploading image', err);
      }
    }
    
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {images.length < maxImages && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-zinc-700 hover:border-purple-500 bg-zinc-950/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors"
        >
          {uploading ? (
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          ) : (
            <>
              <UploadCloud className="w-8 h-8 text-zinc-500 mb-2" />
              <p className="text-sm font-medium text-zinc-400">Click to upload images</p>
              <p className="text-xs text-zinc-600 mt-1">PNG, JPG up to 5MB</p>
            </>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            multiple={maxImages > 1}
            onChange={handleFileChange} 
          />
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {images.map((url, i) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key={i} 
              className="relative aspect-video rounded-xl overflow-hidden group"
            >
              <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  type="button"
                  onClick={() => removeImage(i)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
