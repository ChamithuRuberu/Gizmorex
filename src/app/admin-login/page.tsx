'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Lock, Mail, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      const next = params.get('next') || '/admin';
      router.replace(next.startsWith('/admin') ? next : '/admin');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl shadow-card border border-gray-100 p-8 space-y-4">
        <div className="relative w-40 h-12 mx-auto">
          <Image src="/logo.jpg" alt="Gizmorex" fill className="object-contain" priority />
        </div>
        <h1 className="text-center text-lg font-black text-dark-300">Admin sign in</h1>
        <label className="block">
          <span className="text-xs font-semibold text-gray-700 block mb-1">Email</span>
          <span className="relative block">
            <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-9" />
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </span>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-gray-700 block mb-1">Password</span>
          <span className="relative block">
            <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-9" />
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </span>
        </label>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 disabled:opacity-60">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
