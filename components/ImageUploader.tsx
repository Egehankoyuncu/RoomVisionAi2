import React, { useRef, useState } from 'react';
import { Upload, X, Camera, Image as ImageIcon } from 'lucide-react';
import { fileToBase64, isImageFile } from '../utils/imageUtils';

interface ImageUploaderProps {
  label: string;
  description: string;
  imageSrc: string | null;
  onImageChange: (base64: string | null) => void;
  acceptCamera?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  description,
  imageSrc,
  onImageChange,
  acceptCamera = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File) => {
    if (isImageFile(file)) {
      try {
        const base64 = await fileToBase64(file);
        onImageChange(base64);
      } catch (err) {
        console.error("Error reading file", err);
      }
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-semibold text-slate-200">{label}</label>
        {imageSrc && (
          <button
            onClick={() => onImageChange(null)}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" /> Remove
          </button>
        )}
      </div>

      {!imageSrc ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`
            relative h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300
            flex flex-col items-center justify-center text-center p-6
            ${isDragging 
              ? 'border-indigo-500 bg-indigo-500/10' 
              : 'border-slate-600 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0]);
              }
            }}
          />
          
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4 shadow-lg">
            {acceptCamera ? <Camera className="w-8 h-8 text-indigo-400" /> : <ImageIcon className="w-8 h-8 text-indigo-400" />}
          </div>
          
          <h3 className="text-slate-200 font-medium mb-1">Click to upload or drag & drop</h3>
          <p className="text-slate-400 text-sm max-w-[80%]">{description}</p>
        </div>
      ) : (
        <div className="relative h-64 rounded-xl overflow-hidden border border-slate-600 bg-slate-900 shadow-xl group">
          <img 
            src={imageSrc} 
            alt="Preview" 
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <button 
               onClick={() => onImageChange(null)}
               className="bg-red-500/90 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
             >
               <X className="w-4 h-4" /> Change Image
             </button>
          </div>
        </div>
      )}
    </div>
  );
};
