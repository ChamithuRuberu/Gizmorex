'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Loader2, GripVertical, Trash2 } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

interface SortableImageProps {
  id: string;
  src: string;
  index: number;
  onRemove: () => void;
}

function SortableImage({ id, src, index, onRemove }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group rounded-xl overflow-hidden border-2 border-gray-200 hover:border-[#FF6B00] bg-gray-50 transition-all shadow-xs"
    >
      {/* Draggable surface */}
      <div
        {...attributes}
        {...listeners}
        className="relative w-full aspect-square cursor-grab active:cursor-grabbing"
      >
        <Image
          src={src}
          alt={`Product photo ${index + 1}`}
          fill
          className="object-cover pointer-events-none select-none"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 180px"
        />

        {/* Drag handle pill on hover */}
        <div className="absolute top-2 left-2 bg-black/60 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <GripVertical className="w-3.5 h-3.5" />
        </div>

        {/* First image badge */}
        {index === 0 && (
          <div className="absolute bottom-2 left-2 bg-[#FF6B00] text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-xs">
            Main Cover
          </div>
        )}
      </div>

      {/* Dedicated Remove Button - Isolated from DnD listeners */}
      <button
        type="button"
        title="Remove this image"
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-md transition-all duration-150 hover:scale-110 z-30 cursor-pointer"
        aria-label="Remove image"
      >
        <X className="w-3.5 h-3.5 stroke-[2.5]" />
      </button>

      {/* Hover bottom action bar */}
      <div className="absolute bottom-0 inset-x-0 p-1 bg-black/70 backdrop-blur-xs flex items-center justify-between text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <span className="font-mono">#{index + 1}</span>
        <span className="text-gray-300">Drag to reorder</span>
      </div>
    </div>
  );
}

export default function ImageUpload({
  images,
  onChange,
  maxImages = 10,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  // Configure pointer sensor with activation distance to separate clicks from drags
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requires 8px movement before dragging starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (images.length + acceptedFiles.length > maxImages) {
        toast.error(`You can only upload up to ${maxImages} images`);
        return;
      }

      setUploading(true);
      const toastId = toast.loading('Uploading images...');

      try {
        const uploadPromises = acceptedFiles.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          const data = await response.json();
          if (!data.success) {
            throw new Error(data.error || 'Upload failed');
          }

          return data.url;
        });

        const newUrls = await Promise.all(uploadPromises);
        onChange([...images, ...newUrls]);

        toast.success(
          `Successfully uploaded ${newUrls.length} image${
            newUrls.length > 1 ? 's' : ''
          }`,
          { id: toastId }
        );
      } catch (error: any) {
        console.error('Upload error:', error);
        toast.error(error.message || 'Failed to upload images', { id: toastId });
      } finally {
        setUploading(false);
      }
    },
    [images, maxImages, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    multiple: true,
    disabled: uploading || images.length >= maxImages,
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img, idx) => `img-${idx}-${img}` === active.id);
      const newIndex = images.findIndex((img, idx) => `img-${idx}-${img}` === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onChange(arrayMove(images, oldIndex, newIndex));
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
    toast.success('Image removed!', { icon: '🗑️' });
  };

  // Generate unique IDs for sortable items
  const sortableIds = images.map((img, idx) => `img-${idx}-${img}`);

  return (
    <div className="space-y-4">
      {/* Upload Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
          isDragActive
            ? 'border-[#FF6B00] bg-orange-50'
            : images.length >= maxImages
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-[#FF6B00] hover:bg-orange-50/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          {uploading ? (
            <>
              <Loader2 className="w-10 h-10 text-[#FF6B00] animate-spin" />
              <p className="text-xs font-semibold text-gray-700">Uploading to cloud...</p>
            </>
          ) : images.length >= maxImages ? (
            <>
              <ImageIcon className="w-10 h-10 text-gray-400" />
              <p className="text-xs text-gray-500 font-semibold">
                Maximum {maxImages} images reached
              </p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-orange-100 text-[#FF6B00] flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-700">
                  {isDragActive ? 'Drop images here' : 'Click to browse or drag & drop images'}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  JPG, PNG, WebP up to 10MB ({images.length}/{maxImages} uploaded)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Image Preview Grid with Drag & Drop Reordering */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-bold text-dark-300">
              Uploaded Images ({images.length})
            </span>
            <span>Click ✕ to delete • Drag to reorder</span>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {images.map((src, index) => {
                  const id = `img-${index}-${src}`;
                  return (
                    <SortableImage
                      key={id}
                      id={id}
                      src={src}
                      index={index}
                      onRemove={() => removeImage(index)}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}
