import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFeed, searchImages, toggleLike, toggleBookmark } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import {
  Search, X, Heart, MessageCircle, Share2, Bookmark,
  LayoutList, Grid3x3, Play, ImageOff, ChevronLeft, ChevronRight, MapPin
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const isVideo = url => url && /\.(mp4|webm|mov|avi|mkv|m4v)$/i.test(url);

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm';
  if (s < 86400) return Math.floor(s / 3600) + 'h';
  return Math.floor(s / 86400) + 'd';
}

function FeedCard({ image }) {
  const [liked, setLiked]           = useState(image.isLiked ?? false);
  const [likeCount, setLikeCount]   = useState(image._count?.likes ?? 0);
  const [bookmarked, setBookmarked] = useState(image.isBookmarked ?? false);
  const [toast, setToast]           = useState(false);

  const src   = image.imageUrl.startsWith('http') ? image.imageUrl : `${API_URL}${image.imageUrl}`;
  const video = isVideo(src);

  async function onLike(e) {
    e.preventDefault();
    try { const r = await toggleLike(image.id); setLiked(r.data.liked); setLikeCount(r.data.likeCount); } catch {}
  }
  async function onBookmark(e) {
    e.preventDefault();
    try { const r = await toggleBookmark(image.id); setBookmarked(r.data.bookmarked); } catch {}
  }
  function onShare(e) {
    e.preventDefault();
    navigator.clipboard.writeText(`${window.location.origin}/images/${image.id}`);
    setToast(true); setTimeout(() => setToast(false), 2000);
  }

  return (
    <article className="bg-white border border-stone-200">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-100">
        <div className="w-8 h-8 bg-stone-900 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-white">{image.creator?.name?.[0]?.toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-stone-900 truncate">{image.creator?.name}</p>
          <p className="text-xs text-stone-400">{timeAgo(image.createdAt)} ago</p>
        </div>
        {video && (
          <span className="text-xs font-semibold text-white bg-stone-900 px-2 py-0.5 tracking-wide">VIDEO</span>
        )}
      </div>

      {video ? (
        <div className="bg-black">
          <video src={src} className="w-full max-h-[520px] object-contain" controls preload="metadata" />
        </div>
      ) : (
        <Link to={`/images/${image.id}`} className="block bg-stone-100">
          <img src={src} alt={image.title} className="w-full max-h-[520px] object-contain"
            onError={e => { e.target.src = 'https://placehold.co/600x600?text=Image'; }} />
        </Link>
      )}

      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center gap-0.5 mb-3">
          <button onClick={onLike}
            className={`flex items-center gap-1.5 px-2 py-1.5 text-sm font-medium transition-colors ${liked ? 'text-red-600' : 'text-stone-400 hover:text-stone-700'}`}>
            <Heart className={`w-4 h-4 ${liked ? 'fill-red-600 text-red-600' : ''}`} />
            <span>{likeCount}</span>
          </button>
          <Link to={`/images/${image.id}`}
            className="flex items-center gap-1.5 px-2 py-1.5 text-sm font-medium text-stone-400 hover:text-stone-700 transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span>{image._count?.comments ?? 0}</span>
          </Link>
          <button onClick={onShare}
            className="flex items-center gap-1.5 px-2 py-1.5 text-sm font-medium text-stone-400 hover:text-stone-700 transition-colors">
            <Share2 className="w-4 h-4" />
            {toast && <span className="text-xs text-green-600 font-semibold">Copied!</span>}
          </button>
          <button onClick={onBookmark}
            className={`ml-auto px-2 py-1.5 transition-colors ${bookmarked ? 'text-red-600' : 'text-stone-300 hover:text-stone-600'}`}>
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-red-600 text-red-600' : ''}`} />
          </button>
        </div>
        <p className="text-sm text-stone-700 leading-relaxed">
          <Link to={`/images/${image.id}`} className="font-semibold text-stone-900 hover:text-red-600 transition-colors">{image.creator?.name}</Link>
          {' '}{image.caption || image.title}
        </p>
        {image.location && (
          <p className="flex items-center gap-1 text-xs text-stone-400 mt-1.5">
            <MapPin className="w-3 h-3" /> {image.location}
          </p>
        )}
        {(image._count?.comments ?? 0) > 0 && (
          <Link to={`/images/${image.id}`} className="block text-xs text-stone-400 hover:text-red-600 mt-1.5 transition-colors">
            View all {image._count.comments} comment{image._count.comments !== 1 ? 's' : ''}
          </Link>
        )}
      </div>
    </article>
  );
}

function GridCard({ image }) {
  const src   = image.imageUrl.startsWith('http') ? image.imageUrl : `${API_URL}${image.imageUrl}`;
  const video = isVideo(src);
  return (
    <Link to={`/images/${image.id}`} className="aspect-square overflow-hidden relative group bg-stone-100 block">
      {video
        ? <video src={src} className="w-full h-full object-cover" muted preload="metadata" />
        : <img src={src} alt={image.title} className="w-full h-full object-cover"
            onError={e => { e.target.src = 'https://placehold.co/400x400?text=Image'; }} />}
      {video && (
        <span className="absolute top-1.5 right-1.5 bg-stone-900 text-white p-1">
          <Play className="w-3 h-3 fill-white" />
        </span>
      )}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-5 text-white font-bold">
        <span className="flex items-center gap-1 text-sm"><Heart className="w-4 h-4 fill-white" />{image._count?.likes ?? 0}</span>
        <span className="flex items-center gap-1 text-sm"><MessageCircle className="w-4 h-4 fill-white" />{image._count?.comments ?? 0}</span>
      </div>
    </Link>
  );
}

export default function ConsumerFeed() {
  const { user } = useAuth();
  const [images,       setImages]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [query,        setQuery]        = useState('');
  const [searching,    setSearching]    = useState(false);
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [viewMode,     setViewMode]     = useState('feed');

  async function fetchFeed(p = 1) {
    setLoading(true);
    try {
      const res = await getFeed(p);
      setImages(res.data.images); setTotalPages(res.data.pages); setPage(p); setIsSearchMode(false);
    } finally { setLoading(false); }
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return fetchFeed(1);
    setSearching(true);
    try {
      const res = await searchImages(query);
      setImages(res.data.images); setIsSearchMode(true); setTotalPages(1);
    } finally { setSearching(false); }
  }

  function clearSearch() { setQuery(''); fetchFeed(1); }
  useEffect(() => { fetchFeed(1); }, []);

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <div className={`${viewMode === 'grid' ? 'max-w-4xl' : 'max-w-xl'} mx-auto px-4 py-8 transition-all duration-300`}>

        <div className="flex items-center justify-between mb-6 pb-6 border-b border-stone-200">
          <div>
            <h1 className="font-serif text-2xl text-stone-900">
              {isSearchMode ? `"${query}"` : 'For You'}
            </h1>
            <p className="text-xs text-stone-400 mt-0.5 uppercase tracking-widest">
              Hello, <span className="font-semibold text-red-600">{user?.name}</span>
            </p>
          </div>
          <div className="flex items-center border border-stone-200 bg-white">
            <button onClick={() => setViewMode('feed')}
              className={`p-2 transition-colors ${viewMode === 'feed' ? 'bg-stone-900 text-white' : 'text-stone-400 hover:text-stone-700'}`}>
              <LayoutList className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-stone-900 text-white' : 'text-stone-400 hover:text-stone-700'}`}>
              <Grid3x3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 pointer-events-none" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search photos, videos, people, places…"
              className="w-full bg-white border border-stone-200 pl-9 pr-8 py-2.5 text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-stone-900 transition-colors" />
            {query && (
              <button type="button" onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button type="submit" disabled={searching}
            className="px-5 py-2.5 bg-stone-900 text-white text-sm hover:bg-stone-700 disabled:opacity-50 transition-colors font-medium">
            {searching ? '…' : 'Search'}
          </button>
          {isSearchMode && (
            <button type="button" onClick={clearSearch}
              className="px-3 py-2.5 border border-stone-200 bg-white hover:bg-stone-50 transition-colors text-stone-500">
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {isSearchMode && (
          <div className="mb-5 flex items-center gap-2 text-sm text-stone-600 border-l-2 border-red-500 pl-4 py-1">
            <span><strong>{images.length}</strong> result{images.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;</span>
            <button onClick={clearSearch} className="ml-auto text-red-600 hover:text-red-700 text-xs font-semibold">Clear</button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner message="Loading feed…" /></div>
        ) : images.length === 0 ? (
          <div className="text-center py-24 bg-white border border-dashed border-stone-300">
            <ImageOff className="w-10 h-10 text-stone-300 mx-auto mb-4" />
            <p className="font-serif text-xl text-stone-500 mb-1">Nothing here yet</p>
            <p className="text-sm text-stone-400">
              {isSearchMode ? 'Try a different search term' : "Creators haven't posted anything yet"}
            </p>
            {isSearchMode && (
              <button onClick={clearSearch} className="mt-4 text-red-600 text-sm hover:text-red-700 font-medium">View all</button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-0.5">
            {images.map(img => <GridCard key={img.id} image={img} />)}
          </div>
        ) : (
          <div className="space-y-4">
            {images.map(img => <FeedCard key={img.id} image={img} />)}
          </div>
        )}

        {!isSearchMode && !loading && totalPages > 1 && (
          <div className="mt-10 flex justify-center items-center gap-2">
            <button onClick={() => fetchFeed(page - 1)} disabled={page <= 1}
              className="flex items-center gap-1 px-4 py-2 bg-white border border-stone-200 text-sm text-stone-600 disabled:opacity-30 hover:border-stone-900 hover:text-stone-900 transition-colors font-medium">
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-200">
              {page} / {totalPages}
            </span>
            <button onClick={() => fetchFeed(page + 1)} disabled={page >= totalPages}
              className="flex items-center gap-1 px-4 py-2 bg-white border border-stone-200 text-sm text-stone-600 disabled:opacity-30 hover:border-stone-900 hover:text-stone-900 transition-colors font-medium">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
