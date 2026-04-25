import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { uploadImage, getMyImages, deleteImage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, Trash2, MapPin, Image, Play, AlertCircle, CheckCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const isVideo = url => url && /\.(mp4|webm|mov|avi|mkv|m4v)$/i.test(url);

const inputCls = "w-full bg-transparent border-0 border-b border-stone-300 px-0 py-2 text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-stone-900 transition-colors";

export default function CreatorDashboard() {
  const { user } = useAuth();
  const [images, setImages]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm]           = useState({ title: '', caption: '', location: '', peoplePresent: '' });
  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState('');
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  async function fetchImages() {
    try { const res = await getMyImages(); setImages(res.data.images); }
    catch {}
    finally { setLoading(false); }
  }

  useEffect(() => { fetchImages(); }, []);

  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f); setPreview(URL.createObjectURL(f)); setError('');
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return setError('Please select a file');
    if (!form.title.trim()) return setError('Title is required');
    setError(''); setSuccess(''); setUploading(true);
    try {
      const data = new FormData();
      data.append('image', file);
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      await uploadImage(data);
      setForm({ title: '', caption: '', location: '', peoplePresent: '' });
      setFile(null); setPreview('');
      setSuccess('Uploaded successfully!');
      fetchImages();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally { setUploading(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this item?')) return;
    try { await deleteImage(id); setImages(images.filter(img => img.id !== id)); }
    catch (err) { alert(err.response?.data?.error || 'Delete failed'); }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      <div className="mb-8 pb-6 border-b border-stone-200">
        <h1 className="font-serif text-3xl text-stone-900">Creator Dashboard</h1>
        <p className="text-stone-400 mt-1 text-sm">
          Welcome, <span className="font-semibold text-red-600">{user?.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Upload panel */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-stone-200 p-6 sticky top-24">
            <h2 className="font-serif text-lg text-stone-900 mb-5">Upload Media</h2>
            <form onSubmit={handleUpload} className="space-y-5">

              <div
                onClick={() => document.getElementById('psFileInput').click()}
                className="border-2 border-dashed border-stone-200 p-4 cursor-pointer hover:border-stone-900 transition-colors text-center group"
              >
                {preview ? (
                  isVideo(file?.name)
                    ? <video src={preview} className="w-full h-40 object-cover" muted preload="metadata" />
                    : <img src={preview} alt="preview" className="w-full h-40 object-cover" />
                ) : (
                  <div className="py-6 text-stone-300 group-hover:text-stone-600 transition-colors">
                    <UploadCloud className="w-9 h-9 mx-auto mb-2" />
                    <p className="text-sm font-medium">Click to select file</p>
                    <p className="text-xs mt-1 text-stone-300">Images & videos up to 200MB</p>
                  </div>
                )}
                <input id="psFileInput" type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />
              </div>

              <div className="space-y-4">
                <input type="text" placeholder="Title *" required value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} />
                <textarea placeholder="Caption" rows={2} value={form.caption}
                  onChange={e => setForm({ ...form, caption: e.target.value })}
                  className={inputCls + ' resize-none'} />
                <input type="text" placeholder="Location" value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })} className={inputCls} />
                <input type="text" placeholder="People present (comma-separated)" value={form.peoplePresent}
                  onChange={e => setForm({ ...form, peoplePresent: e.target.value })} className={inputCls} />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-xs border-l-2 border-red-500 pl-3 py-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 text-green-700 text-xs border-l-2 border-green-500 pl-3 py-1">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" /> {success}
                </div>
              )}

              <button type="submit" disabled={uploading}
                className="w-full py-3 bg-stone-900 text-white font-semibold hover:bg-stone-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-sm">
                {uploading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</>
                  : <><UploadCloud className="w-4 h-4" /> Upload</>}
              </button>
            </form>
          </div>
        </div>

        {/* Gallery */}
        <div className="lg:col-span-2">
          <h2 className="font-serif text-lg text-stone-900 mb-5">
            Your Media <span className="text-stone-400 font-sans text-sm font-normal">({images.length})</span>
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-stone-400 text-sm">Loading...</div>
          ) : images.length === 0 ? (
            <div className="text-center py-20 bg-white border border-dashed border-stone-300">
              <Image className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <p className="font-serif text-xl text-stone-400 mb-1">No media yet</p>
              <p className="text-sm text-stone-400">Upload your first photo or video</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {images.map(img => {
                const src   = img.imageUrl.startsWith('http') ? img.imageUrl : `${API_URL}${img.imageUrl}`;
                const video = isVideo(src);
                return (
                  <Link key={img.id} to={`/images/${img.id}`}
                    className="group relative bg-white border border-stone-200 overflow-hidden hover:border-stone-900 transition-colors block">
                    <div className="aspect-square bg-stone-100 relative">
                      {video
                        ? <video src={src} className="w-full h-full object-cover" controls preload="metadata" onClick={e => e.stopPropagation()} />
                        : <img src={src} alt={img.title} className="w-full h-full object-cover"
                            onError={e => { e.target.src = 'https://placehold.co/300x300?text=No+Image'; }} />}
                      {video && (
                        <span className="absolute top-2 left-2 bg-stone-900 text-white text-xs px-1.5 py-0.5">
                          <Play className="w-2.5 h-2.5 fill-white inline" />
                        </span>
                      )}
                    </div>
                    <div className="p-2.5 border-t border-stone-100">
                      <p className="text-sm font-medium text-stone-800 truncate">{img.title}</p>
                      {img.location && (
                        <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {img.location}
                        </p>
                      )}
                    </div>
                    <button onClick={e => { e.preventDefault(); handleDelete(img.id); }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white p-1.5 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
