import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldOff, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  const { isCreator } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4">
      <div className="w-px h-16 bg-stone-300 mb-8" />
      <ShieldOff className="w-10 h-10 text-stone-400 mb-5" />
      <h1 className="font-serif text-4xl text-stone-900 mb-3">Access Denied</h1>
      <p className="text-stone-400 mb-8 max-w-sm text-sm">You don&apos;t have permission to view this page.</p>
      <button onClick={() => navigate(isCreator ? '/creator' : '/feed')}
        className="flex items-center gap-2 px-7 py-3.5 bg-stone-900 text-white font-semibold hover:bg-stone-700 transition-colors text-sm tracking-wide">
        <ArrowLeft className="w-4 h-4" /> Go to Dashboard
      </button>
      <Link to="/" className="mt-5 text-sm text-stone-300 hover:text-stone-600 transition-colors">Back to Home</Link>
    </div>
  );
}
