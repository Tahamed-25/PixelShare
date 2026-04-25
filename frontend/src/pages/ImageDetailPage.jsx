import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getImage, deleteImage, toggleLike, toggleBookmark, toggleFollow } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';
import RatingForm from '../components/RatingForm';
import LoadingSpinner from '../components/LoadingSpinner';
import { ChevronLeft, Trash2, MapPin, Users, Calendar, AlertCircle, Heart, Bookmark, Share2, UserPlus, UserCheck } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const isVideo = url => url && /\.(mp4|webm|mov|avi|mkv|m4v)$/i.test(url);

export default function ImageDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isCreator } = useAuth();
  const [image, setImage]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [liked, setLiked]               = useState(false);
  const [likeCount, setLikeCount]       = useState(0);
  const [bookmarked, setBookmarked]     = useState(false);
  const [following, setFollowing]       = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [shareToast, setShareToast]     = useState(false);
  const [likeLoading, setLikeLoading]         = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [followLoading, setFollowLoading]     = useState(false);

  async function fetchImage() {
    try {
      const res = await getImage(id);
      const img = res.data;
      setImage(img);
      setLiked(img.isLiked ?? false);
      setLikeCount(img.likeCount ?? 0);
      setBookmarked(img.isBookmarked ?? false);
      setFollowing(img.isFollowing ?? false);
      setFollowerCount(img.followerCount ?? 0);
    } catch { setError('Media not found'); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchImage(); }, [id]);

  async function handleDelete() {
    if (!window.confirm('Delete this item?')) return;
    try { await deleteImage(id); navigate('/creator'); }
    catch (err) { alert(err.response?.data?.error || 'Delete failed'); }
  }

  async function handleLike() {
    if (likeLoading) return;
    setLikeLoading(true);
    try { const r = await toggleLike(id); setLiked(r.data.liked); setLikeCount(r.data.likeCount); }
    catch {} finally { setLikeLoading(false); }
  }

  async function handleBookmark() {
    if (bookmarkLoading) return;
    setBookmarkLoading(true);
    try { const r = await toggleBookmark(id); setBookmarked(r.data.bookmarked); }
    catch {} finally { setBookmarkLoading(false); }
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShareToast(true); setTimeout(() => setShareToast(false), 2000);
    });
  }

  async function handleFollow() {
    if (followLoading) return;
    setFollowLoading(true);
    try { const r = await toggleFollow(image.creator.id); setFollowing(r.data.following); setFollowerCount(r.data.followerCount); }
    catch {} finally { setFollowLoading(false); }
  }

  if (loading) return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center"><LoadingSpinner /></div>
  );

  if (error || !image) return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4">
      <AlertCircle className="w-10 h-10 text-red-400 mb-4" />
      <p className="font-serif text-xl text-stone-600 mb-1">{error || 'Media not found'}</p>
      <button onClick={() => navigate(-1)} className="mt-3 text-red-600 hover:text-red-700 text-sm font-medium">Go back</button>
    </div>
  );

  const src      = image.imageUrl.startsWith('http') ? image.imageUrl : `${API_URL}${image.imageUrl}`;
  const video    = isVideo(src);
  const isOwner  = isCreator && image.creator?.id === user?.id;
  const canFollow = user?.role === 'consumer' && image.creator?.id !== user?.id;

  const btnBase   = "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border transition-colors";
  const btnActive = `${btnBase} border-red-300 bg-red-50 text-red-600`;
  const btnIdle   = `${btnBase} border-stone-200 bg-white text-stone-500 hover:border-stone-900 hover:text-stone-900`;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-red-600 mb-8 transition-colors font-medium">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* Media */}
        <div>
          <div className="overflow-hidden bg-stone-100 border border-stone-200">
            {video
              ? <video src={src} className="w-full max-h-[600px]" controls preload="metadata" />
              : <img src={src} alt={image.title} className="w-full object-contain max-h-[600px]"
                  onError={e => { e.target.src = 'https://placehold.co/600x600?text=No+Image'; }} />}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between pb-5 border-b border-stone-200">
            <h1 className="font-serif text-2xl text-stone-900 leading-tight">{image.title}</h1>
            {isOwner && (
              <button onClick={handleDelete}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors shrink-0 ml-3">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-stone-500">
            <div className="w-7 h-7 bg-stone-900 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {image.creator?.name?.[0]?.toUpperCase()}
            </div>
            <span className="font-medium text-stone-700">{image.creator?.name}</span>
            <span className="text-stone-300">·</span>
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(image.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handleLike} disabled={likeLoading} className={liked ? btnActive : btnIdle}>
              <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
              {likeCount}
            </button>
            {user?.role === 'consumer' && (
              <button onClick={handleBookmark} disabled={bookmarkLoading} className={bookmarked ? btnActive : btnIdle}>
                <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-red-500 text-red-500' : ''}`} />
                {bookmarked ? 'Saved' : 'Save'}
              </button>
            )}
            <button onClick={handleShare} className={btnIdle}>
              <Share2 className="w-4 h-4" />
              {shareToast ? 'Copied!' : 'Share'}
            </button>
            {canFollow && (
              <button onClick={handleFollow} disabled={followLoading}
                className={`${btnBase} ml-auto ${following
                  ? 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                  : 'border-stone-900 bg-stone-900 text-white hover:bg-stone-700'}`}>
                {following ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {following ? `Following · ${followerCount}` : `Follow · ${followerCount}`}
              </button>
            )}
          </div>

          {image.caption && <p className="text-stone-500 text-sm leading-relaxed">{image.caption}</p>}

          <div className="flex flex-wrap gap-2">
            {image.location && (
              <span className="flex items-center gap-1.5 text-sm text-stone-600 bg-stone-100 border border-stone-200 px-3 py-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-500" /> {image.location}
              </span>
            )}
            {image.peoplePresent && (
              <span className="flex items-center gap-1.5 text-sm text-stone-600 bg-stone-100 border border-stone-200 px-3 py-1.5">
                <Users className="w-3.5 h-3.5 text-stone-400" /> {image.peoplePresent}
              </span>
            )}
          </div>

          <div className="border-t border-stone-200 pt-5">
            <RatingForm imageId={image.id} avgRating={image.avgRating} totalRatings={image.ratings?.length ?? 0} onRate={fetchImage} />
          </div>
          <div className="border-t border-stone-200 pt-5">
            <CommentSection imageId={image.id} comments={image.comments || []} onAdd={fetchImage} />
          </div>
        </div>
      </div>
    </div>
  );
}
