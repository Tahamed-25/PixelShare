import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ArrowRight, Check, X } from 'lucide-react';

const TRUSTED_DOMAINS = new Set([
  'gmail.com','googlemail.com','outlook.com','hotmail.com','live.com','msn.com',
  'hotmail.co.uk','live.co.uk','outlook.co.uk','hotmail.fr','live.fr','outlook.fr',
  'hotmail.de','live.de','outlook.de','hotmail.it','live.it','outlook.it',
  'hotmail.es','live.es','outlook.es','icloud.com','me.com','mac.com',
  'yahoo.com','yahoo.co.uk','yahoo.fr','yahoo.de','yahoo.es','yahoo.it',
  'yahoo.ca','yahoo.com.au','yahoo.co.jp','yahoo.com.br','ymail.com','rocketmail.com',
  'proton.me','protonmail.com','protonmail.ch','pm.me','aol.com','aol.co.uk',
  'zoho.com','zohomail.com','fastmail.com','fastmail.fm','fastmail.org',
  'gmx.com','gmx.net','gmx.de','gmx.co.uk','gmx.at','mail.com','email.com',
  'usa.com','post.com','tutanota.com','tutamail.com','tuta.io',
  'hey.com','yandex.com','yandex.ru','mailfence.com',
]);

function getEmailError(email) {
  if (!email) return null;
  const parts = email.toLowerCase().split('@');
  if (parts.length !== 2 || !parts[1]) return null;
  return TRUSTED_DOMAINS.has(parts[1]) ? null : 'Use a trusted provider: Gmail, Outlook, iCloud, Yahoo, ProtonMail…';
}

const PW_CHECKS = [
  { key: 'length',  label: 'At least 8 characters',     test: p => p.length >= 8 },
  { key: 'upper',   label: 'One uppercase letter (A–Z)', test: p => /[A-Z]/.test(p) },
  { key: 'lower',   label: 'One lowercase letter (a–z)', test: p => /[a-z]/.test(p) },
  { key: 'number',  label: 'One number (0–9)',           test: p => /[0-9]/.test(p) },
  { key: 'special', label: 'One special character',      test: p => /[!@#$%^&*()_+\-=[\]{}|;':.,<>?/\\]/.test(p) },
];

const STRENGTH = [
  { label: 'Very weak', w: '1/5', color: 'bg-red-500',    text: 'text-red-600' },
  { label: 'Weak',      w: '2/5', color: 'bg-orange-400', text: 'text-orange-600' },
  { label: 'Fair',      w: '3/5', color: 'bg-yellow-400', text: 'text-yellow-600' },
  { label: 'Good',      w: '4/5', color: 'bg-lime-500',   text: 'text-lime-600' },
  { label: 'Strong',    w: '5/5', color: 'bg-green-500',  text: 'text-green-600' },
];

const inputCls = "w-full bg-transparent border-0 border-b border-stone-300 px-0 py-2.5 text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-stone-900 transition-colors";

export default function RegisterPage() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const checks = useMemo(() => PW_CHECKS.map(c => ({ ...c, pass: c.test(form.password) })), [form.password]);
  const score = checks.filter(c => c.pass).length;
  const strength = STRENGTH[Math.min(score, STRENGTH.length - 1)];
  const emailError = emailTouched ? getEmailError(form.email) : null;
  const pwAllPass = checks.every(c => c.pass);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const eErr = getEmailError(form.email);
    if (eErr) { setEmailTouched(true); return setError(eErr); }
    if (!pwAllPass) return setError('Password does not meet all requirements');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setLoading(true);
    try {
      const res = await register({ name: form.name, email: form.email, password: form.password });
      loginUser(res.data.token, res.data.user);
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#fafaf9] flex">

      {/* Left panel */}
      <div className="hidden lg:flex w-2/5 flex-col justify-between p-14 border-r border-stone-200 bg-white">
        <div className="space-y-8">
          <div className="w-10 h-10 bg-stone-900 flex items-center justify-center">
            <span className="text-white font-serif font-bold text-sm">PS</span>
          </div>
          <div>
            <div className="w-8 h-px bg-red-600 mb-6" />
            <h2 className="font-serif text-4xl text-stone-900 leading-tight">
              Join the<br />community.
            </h2>
            <p className="mt-4 text-stone-400 text-sm leading-relaxed font-light">
              Create your account and start sharing pixels that tell stories only you can tell.
            </p>
          </div>
        </div>
        <p className="text-xs text-stone-300 tracking-widest uppercase">PixelShare &mdash; 2025</p>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm">

          <div className="mb-10">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-[0.2em] mb-3">Create account</p>
            <h1 className="font-serif text-3xl text-stone-900">Your profile</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="block text-xs font-medium text-stone-400 uppercase tracking-[0.15em] mb-3">Full Name</label>
              <input type="text" required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Your name" className={inputCls} />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-400 uppercase tracking-[0.15em] mb-3">Email</label>
              <input type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                onBlur={() => setEmailTouched(true)}
                placeholder="you@gmail.com"
                className={inputCls + (emailError ? ' border-red-500' : '')} />
              {emailError && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <X className="w-3 h-3 shrink-0" /> {emailError}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-400 uppercase tracking-[0.15em] mb-3">Password</label>
              <input type="password" required value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••" className={inputCls} />
              {form.password && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1 h-0.5">
                    {[0,1,2,3,4].map(i => (
                      <div key={i} className={`flex-1 transition-all ${i < score ? strength.color : 'bg-stone-200'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-semibold ${strength.text}`}>{strength.label}</p>
                  <div className="space-y-0.5">
                    {checks.map(c => (
                      <span key={c.key} className={`text-xs flex items-center gap-1.5 ${c.pass ? 'text-green-600' : 'text-stone-400'}`}>
                        {c.pass ? <Check className="w-3 h-3 shrink-0" /> : <span className="w-3 h-3 shrink-0 border border-stone-300 inline-block" />}
                        {c.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-400 uppercase tracking-[0.15em] mb-3">Confirm Password</label>
              <input type="password" required value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                placeholder="••••••••" className={inputCls} />
              {form.confirm && form.password !== form.confirm && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <X className="w-3 h-3 shrink-0" /> Passwords do not match
                </p>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 border-l-2 border-red-500 pl-3 py-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-stone-900 text-white font-semibold hover:bg-stone-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-sm tracking-wide mt-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
                : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-stone-200">
            <p className="text-sm text-stone-400">
              Already have an account?{' '}
              <Link to="/login" className="text-red-600 font-semibold hover:text-red-700 transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
