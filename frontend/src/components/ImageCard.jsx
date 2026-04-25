import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, MessageCircle, Star, Play, Heart } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const isVideo = (url) => url && /\.(mp4|webm|mov|avi|mkv|m4v)$/i.test(url);

export default function ImageCard({ image }) {
  const src   = image.imageUrl.startsWith('http') ? image.imageUrl : `${API_URL}${image.imageUrl}`;
  const video = isVideo(src);

  return (
    <Link to={`/images/${image.id}`} className="group block bg-white border border-stone-200 overflow-hidden hover:border-stone-400 transition-colors">
      <div className="aspect-square overflow-hidden bg-stone-100 relative">
        {video ? (
          <video src={src} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" muted preload="metadata" />
        ) : (
          <img src={src} alt={image.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = 'https://placehold.co/400x400?text=No+Image'; }} />
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {video && (
          <span className="absolute top-2 left-2 bg-stone-900 text-white text-xs px-2 py-0.5 font-medium tracking-wide">
            VIDEO
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <p className="text-white text-sm font-medium truncate">{image.title}</p>
          {image.location && (
            <p className="text-white/70 text-xs flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" /> {image.location}
            </p>
          )}
        </div>
      </div>
      <div className="p-3 border-t border-stone-100">
        <h3 className="font-medium text-stone-900 truncate text-sm">{image.title}</h3>
        <div className="flex items-center justify-between mt-1 text-xs text-stone-400">
          <span className="font-medium text-red-600 truncate">{image.creator?.name}</span>
          <span className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-0.5"><Heart className="w-3 h-3" /> {image._count?.likes ?? 0}</span>
            <span className="flex items-center gap-0.5"><MessageCircle className="w-3 h-3" /> {image._count?.comments ?? 0}</span>
            <span className="flex items-center gap-0.5"><Star className="w-3 h-3" /> {image._count?.ratings ?? 0}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
