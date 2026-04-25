import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

const inputCls = "w-full bg-transparent border-0 border-b border-stone-300 px-0 py-2.5 text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-stone-900 transition-colors";

export default function LoginPage() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data.token, res.data.user);
      navigate(res.data.user.role === 'creator' ? '/creator' : '/feed');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#fafaf9] flex">

      {/* Left: editorial panel */}
      <div className="hidden lg:flex w-2/5 flex-col justify-between p-14 border-r border-stone-200 bg-white">
        <div className="space-y-8">
          <div className="w-10 h-10 bg-stone-900 flex items-center justify-center">
            <span className="text-white font-serif font-bold text-sm">PS</span>
          </div>
          <div>
            <div className="w-8 h-px bg-red-600 mb-6" />
            <h2 className="font-serif text-4xl text-stone-900 leading-tight">
              Welcome<br />back.
            </h2>
            <p className="mt-4 text-stone-400 text-sm leading-relaxed font-light">
              Sign in to access your creative space and rediscover the stories you love.
            </p>
          </div>
        </div>
        <p className="text-xs text-stone-300 tracking-widest uppercase">PixelShare &mdash; 2025</p>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-sm">

          <div className="mb-10">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-[0.2em] mb-3">Sign in</p>
            <h1 className="font-serif text-3xl text-stone-900">Your account</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">

            <div>
              <label className="block text-xs font-medium text-stone-400 uppercase tracking-[0.15em] mb-3">Email Address</label>
              <input type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com" className={inputCls} />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-400 uppercase tracking-[0.15em] mb-3">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••" className={inputCls + ' pr-8'} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-600 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 border-l-2 border-red-500 pl-3 py-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-stone-900 text-white font-semibold hover:bg-stone-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-sm tracking-wide mt-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-stone-200">
            <p className="text-sm text-stone-400">
              New to PixelShare?{' '}
              <Link to="/register" className="text-red-600 font-semibold hover:text-red-700 transition-colors">Create account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
