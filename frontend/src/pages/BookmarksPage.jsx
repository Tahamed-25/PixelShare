import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBookmarks } from '../services/api';
import ImageCard from '../components/ImageCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Bookmark, ImageOff } from 'lucide-react';

export default function BookmarksPage() {
  const [images, setImages]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBookmarks()
      .then(res => setImages(res.data.bookmarks))
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8 pb-6 border-b border-stone-200 flex items-end justify-between">
        <div>
          <p className="text-xs font-medium text-stone-400 uppercase tracking-[0.2em] mb-1">Collection</p>
          <h1 className="font-serif text-3xl text-stone-900">Saved</h1>
        </div>
        <span className="text-sm text-stone-400 mb-1">{images.length} item{images.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading saved items..." />
      ) : images.length === 0 ? (
        <div className="text-center py-24 bg-white border border-dashed border-stone-300">
          <ImageOff className="w-10 h-10 text-stone-300 mx-auto mb-4" />
          <p className="font-serif text-xl text-stone-500 mb-1">Nothing saved yet</p>
          <p className="text-sm text-stone-400 mb-4">Bookmark images on the detail page to collect them here</p>
          <Link to="/feed" className="text-red-600 text-sm hover:text-red-700 font-medium">Browse feed</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map(img => <ImageCard key={img.id} image={img} />)}
        </div>
      )}
    </div>
  );
}
