import React from 'react';
import { Link } from 'react-router-dom';
import { Share2, ArrowRight, Star, Shield, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#fafaf9] flex flex-col">

      {/* Thin red accent bar */}
      <div className="h-px bg-red-600" />

      {/* Hero */}
      <section className="flex-1 max-w-6xl mx-auto w-full px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left: editorial headline */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-red-600" />
            <span className="text-xs font-medium text-stone-400 uppercase tracking-[0.2em]">Media sharing platform</span>
          </div>

          <h1 className="font-serif text-6xl lg:text-7xl text-stone-900 leading-[1.05] tracking-tight">
            Every pixel,<br />
            <em className="not-italic text-red-600">every</em>{' '}
            story.
          </h1>

          <p className="text-stone-500 text-lg leading-relaxed max-w-md font-sans font-light">
            Upload photos and videos. Discover content that moves you.
            Connect with creators who see the world differently.
          </p>

          <div className="flex gap-3 flex-wrap items-center">
            <Link to="/register"
              className="flex items-center gap-2 px-7 py-3.5 bg-stone-900 text-white font-semibold hover:bg-stone-700 transition-colors text-sm tracking-wide">
              Start sharing <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login"
              className="flex items-center gap-2 px-7 py-3.5 border border-stone-300 text-stone-700 font-medium hover:border-stone-900 hover:text-stone-900 transition-colors text-sm">
              Sign in
            </Link>
          </div>

          <div className="flex items-center gap-6 text-xs text-stone-400 pt-2 font-medium tracking-wide uppercase">
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-stone-400" /> JWT Secured</span>
            <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-stone-400" /> Star Ratings</span>
            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-stone-400" /> Role-based</span>
          </div>
        </div>

        {/* Right: editorial feature list */}
        <div className="space-y-0 border border-stone-200 bg-white">
          {[
            { label: '01', title: 'Upload & Share', desc: 'Drag-and-drop photos and videos up to 200 MB with instant processing' },
            { label: '02', title: 'Discover Content', desc: 'Powerful search across a growing library of media from real creators' },
            { label: '03', title: 'Rate & Comment', desc: 'Engage with star ratings and threaded comments on every post' },
            { label: '04', title: 'Follow Creators', desc: 'Build your network. Follow the voices that inspire you most' },
          ].map(({ label, title, desc }, i) => (
            <div key={label}
              className={`flex gap-6 p-6 ${i < 3 ? 'border-b border-stone-100' : ''} hover:bg-stone-50 transition-colors`}>
              <span className="font-serif text-stone-300 text-xl font-medium shrink-0 w-6">{label}</span>
              <div>
                <p className="font-semibold text-stone-900 text-sm mb-1">{title}</p>
                <p className="text-xs text-stone-400 leading-relaxed font-light">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom rule */}
      <div className="border-t border-stone-200 py-6">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <span className="text-xs text-stone-300 tracking-widest uppercase">PixelShare — Visual Media Platform</span>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-red-600 rounded-full" />
            <div className="w-1 h-1 bg-stone-300 rounded-full" />
            <div className="w-1 h-1 bg-stone-300 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
