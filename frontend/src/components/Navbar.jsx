import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Rss, Menu, X, Bookmark, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() { logout(); navigate('/'); }

  const linkCls = "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors";

  return (
    <nav className="sticky top-0 z-50 bg-[#fafaf9] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-stone-900 flex items-center justify-center shrink-0">
            <span className="text-white font-serif text-xs font-bold leading-none">PS</span>
          </div>
          <span className="font-serif text-stone-900 font-medium tracking-tight text-base">PixelShare</span>
        </Link>

        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-0.5">
          {user ? (
            <>
              {user.role === 'consumer' && (
                <>
                  <Link to="/feed" className={linkCls}><Rss className="w-3.5 h-3.5" /> Feed</Link>
                  <Link to="/bookmarks" className={linkCls}><Bookmark className="w-3.5 h-3.5" /> Saved</Link>
                </>
              )}
              {user.role === 'creator' && (
                <>
                  <Link to="/feed" className={linkCls}><Rss className="w-3.5 h-3.5" /> Feed</Link>
                  <Link to="/creator" className={linkCls}><LayoutDashboard className="w-3.5 h-3.5" /> Dashboard</Link>
                </>
              )}
              <div className="flex items-center gap-1.5 pl-3 ml-2 border-l border-stone-200">
                <Link to="/profile"
                  className="w-7 h-7 bg-stone-900 flex items-center justify-center hover:bg-stone-700 transition-colors">
                  <span className="text-xs font-bold text-white">{user.name?.[0]?.toUpperCase()}</span>
                </Link>
                <button onClick={handleLogout}
                  className="p-1.5 text-stone-400 hover:text-red-600 transition-colors">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-stone-500 hover:text-stone-900 px-3 py-1.5 transition-colors">Sign in</Link>
              <Link to="/register" className="text-sm font-semibold bg-stone-900 text-white px-4 py-1.5 hover:bg-stone-700 transition-colors ml-1">Get started</Link>
            </>
          )}
        </div>

        <button className="sm:hidden p-1.5 text-stone-500 hover:text-stone-900 transition-colors" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="sm:hidden border-t border-stone-200 bg-[#fafaf9] px-6 py-3 space-y-0.5">
          {user ? (
            <>
              {user.role === 'consumer' && <Link to="/feed" onClick={() => setOpen(false)} className="flex items-center gap-2 px-2 py-2 text-sm text-stone-700 hover:text-stone-900"><Rss className="w-4 h-4" /> Feed</Link>}
              {user.role === 'consumer' && <Link to="/bookmarks" onClick={() => setOpen(false)} className="flex items-center gap-2 px-2 py-2 text-sm text-stone-700 hover:text-stone-900"><Bookmark className="w-4 h-4" /> Saved</Link>}
              {user.role === 'creator' && <Link to="/feed" onClick={() => setOpen(false)} className="flex items-center gap-2 px-2 py-2 text-sm text-stone-700 hover:text-stone-900"><Rss className="w-4 h-4" /> Feed</Link>}
              {user.role === 'creator' && <Link to="/creator" onClick={() => setOpen(false)} className="flex items-center gap-2 px-2 py-2 text-sm text-stone-700 hover:text-stone-900"><LayoutDashboard className="w-4 h-4" /> Dashboard</Link>}
              <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 px-2 py-2 text-sm text-stone-700 hover:text-stone-900"><User className="w-4 h-4" /> Profile</Link>
              <button onClick={handleLogout} className="flex items-center gap-2 px-2 py-2 text-sm text-red-600 w-full text-left"><LogOut className="w-4 h-4" /> Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="block px-2 py-2 text-sm text-stone-700">Sign in</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="block px-2 py-2 text-sm bg-stone-900 text-white font-semibold text-center mt-1">Get started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
