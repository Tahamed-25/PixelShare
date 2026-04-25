import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyProfile, getMyImages } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Mail, Image, Heart, Bookmark, Users, MessageCircle, Upload, UserCheck } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const isVideo = url => url && /\.(mp4|webm|mov|avi|mkv|m4v)$/i.test(url);

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [myImages, setMyImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getMyProfile();
        setProfile(res.data);
        if (res.data.role === 'creator') {
          const imgRes = await getMyImages();
          setMyImages(imgRes.data.images || []);
        }
      } catch {}
      finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-stone-400 text-sm">Loading...</div>
  );
  if (!profile) return null;

  const isCreator = profile.role === 'creator';
  const stats = isCreator ? [
    { label: 'Posts',          value: profile.stats.posts,         icon: Upload },
    { label: 'Likes Received', value: profile.stats.likesReceived, icon: Heart },
    { label: 'Followers',      value: profile.stats.followers,     icon: Users },
    { label: 'Comments',       value: profile.stats.comments,      icon: MessageCircle },
  ] : [
    { label: 'Liked Posts', value: profile.stats.likesGiven,  icon: Heart },
    { label: 'Saved',       value: profile.stats.bookmarks,   icon: Bookmark },
    { label: 'Following',   value: profile.stats.following,   icon: UserCheck },
    { label: 'Comments',    value: profile.stats.comments,    icon: MessageCircle },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      {/* Profile header */}
      <div className="bg-white border border-stone-200 p-8 mb-5">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-stone-900 flex items-center justify-center flex-shrink-0">
            <span className="text-3xl font-serif font-bold text-white">{profile.name?.[0]?.toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="font-serif text-2xl text-stone-900">{profile.name}</h1>
              <span className={`text-xs font-medium px-2.5 py-0.5 border tracking-wide uppercase ${isCreator ? 'border-red-300 text-red-600 bg-red-50' : 'border-stone-300 text-stone-500'}`}>
                {isCreator ? 'Creator' : 'Consumer'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-stone-500">
              <Mail className="w-3.5 h-3.5" /> {profile.email}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-stone-400">
              <Calendar className="w-3.5 h-3.5" />
              Member since {new Date(profile.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="bg-white border border-stone-200 grid grid-cols-2 sm:grid-cols-4 divide-x divide-stone-100 mb-5">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="p-5 text-center">
            <Icon className="w-4 h-4 mx-auto mb-2 text-stone-400" />
            <p className="font-serif text-2xl text-stone-900">{value ?? 0}</p>
            <p className="text-xs text-stone-400 mt-0.5 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      {/* Creator uploads */}
      {isCreator && (
        <div className="bg-white border border-stone-200 p-6">
          <h2 className="font-serif text-lg text-stone-900 mb-4 flex items-center gap-2">
            <Image className="w-4 h-4 text-stone-400" /> My Uploads ({myImages.length})
          </h2>
          {myImages.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-8">
              No uploads yet.{' '}
              <Link to="/creator" className="text-red-600 hover:text-red-700 font-medium">Upload something!</Link>
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {myImages.slice(0, 12).map(img => {
                const src = img.imageUrl.startsWith('http') ? img.imageUrl : `${API_URL}${img.imageUrl}`;
                return (
                  <Link key={img.id} to={`/images/${img.id}`}
                    className="aspect-square overflow-hidden bg-stone-100 block hover:opacity-80 transition-opacity">
                    {isVideo(src)
                      ? <video src={src} className="w-full h-full object-cover" preload="metadata" muted />
                      : <img src={src} alt={img.title} className="w-full h-full object-cover"
                          onError={e => { e.target.src = 'https://placehold.co/200x200?text=No+Image'; }} />}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Consumer activity */}
      {!isCreator && (
        <div className="bg-white border border-stone-200 p-6 text-center py-12">
          <Heart className="w-8 h-8 text-stone-200 mx-auto mb-3" />
          <p className="text-stone-400 text-sm">
            Browse the{' '}
            <Link to="/feed" className="text-red-600 font-semibold hover:text-red-700">feed</Link>
            {' '}to like, save, and follow creators.
          </p>
        </div>
      )}
    </div>
  );
}
