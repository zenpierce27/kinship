'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, WARMTH_TIERS } from '@/lib/supabase';
import { ArrowLeft, Save } from 'lucide-react';

export default function AddContact() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    current_company: '',
    job_title: '',
    how_we_met: '',
    warmth_tier: 'contact',
    notes: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name.trim()) return;
    
    setSaving(true);
    
    const { error } = await supabase
      .from('persons')
      .insert({
        user_id: '550e8400-e29b-41d4-a716-446655440000', // Default user
        full_name: form.full_name,
        emails: form.email ? [{ email: form.email, primary: true }] : [],
        current_company: form.current_company || null,
        job_title: form.job_title || null,
        how_we_met: form.how_we_met || null,
        warmth_tier: form.warmth_tier,
        notes: form.notes || null,
        met_date: new Date().toISOString().split('T')[0],
        embedding_stale: true,
      });
    
    if (!error) {
      router.push('/');
    }
    setSaving(false);
  }

  return (
    <div className="max-w-lg">
      <a href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back
      </a>

      <h1 className="text-2xl font-bold mb-6">Add Contact</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Name *</label>
          <input
            type="text"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded focus:border-pink-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded focus:border-pink-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Company</label>
            <input
              type="text"
              value={form.current_company}
              onChange={(e) => setForm({ ...form, current_company: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded focus:border-pink-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Title</label>
            <input
              type="text"
              value={form.job_title}
              onChange={(e) => setForm({ ...form, job_title: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded focus:border-pink-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">How we met</label>
          <input
            type="text"
            value={form.how_we_met}
            onChange={(e) => setForm({ ...form, how_we_met: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded focus:border-pink-500 focus:outline-none"
            placeholder="Conference, intro from X, etc."
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Warmth Tier</label>
          <select
            value={form.warmth_tier}
            onChange={(e) => setForm({ ...form, warmth_tier: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded focus:border-pink-500 focus:outline-none"
          >
            {WARMTH_TIERS.map(t => (
              <option key={t} value={t}>{t.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full h-24 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded focus:border-pink-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving || !form.full_name.trim()}
          className="w-full py-3 bg-pink-600 hover:bg-pink-500 disabled:bg-zinc-700 rounded font-medium flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Contact'}
        </button>
      </form>
    </div>
  );
}
