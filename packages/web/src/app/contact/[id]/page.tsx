'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, Person, TIER_COLORS, WARMTH_TIERS } from '@/lib/supabase';
import { ArrowLeft, Mail, Phone, Building, Calendar, Edit, Trash2, Save } from 'lucide-react';

export default function ContactDetail() {
  const params = useParams();
  const router = useRouter();
  const [contact, setContact] = useState<Person | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Person>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContact();
  }, [params.id]);

  async function loadContact() {
    const { data, error } = await supabase
      .from('persons')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (!error && data) {
      setContact(data);
      setForm(data);
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!contact) return;
    
    const { error } = await supabase
      .from('persons')
      .update({
        full_name: form.full_name,
        current_company: form.current_company,
        job_title: form.job_title,
        warmth_tier: form.warmth_tier,
        notes: form.notes,
      })
      .eq('id', contact.id);
    
    if (!error) {
      setEditing(false);
      loadContact();
    }
  }

  async function handleDelete() {
    if (!contact || !confirm('Delete this contact?')) return;
    
    const { error } = await supabase
      .from('persons')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', contact.id);
    
    if (!error) {
      router.push('/');
    }
  }

  if (loading) return <div className="text-zinc-500">Loading...</div>;
  if (!contact) return <div className="text-zinc-500">Contact not found</div>;

  const tierColor = TIER_COLORS[contact.warmth_tier] || 'bg-zinc-500';

  return (
    <div className="max-w-2xl">
      {/* Back button */}
      <a href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to network
      </a>

      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className={`w-20 h-20 rounded-full ${tierColor} flex items-center justify-center text-white text-2xl font-medium`}>
          {contact.full_name.charAt(0)}
        </div>
        <div className="flex-1">
          {editing ? (
            <input
              type="text"
              value={form.full_name || ''}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="text-2xl font-bold bg-zinc-900 border border-zinc-700 rounded px-2 py-1 w-full"
            />
          ) : (
            <h1 className="text-2xl font-bold">{contact.full_name}</h1>
          )}
          
          <div className="flex items-center gap-2 mt-2">
            {editing ? (
              <select
                value={form.warmth_tier || ''}
                onChange={(e) => setForm({ ...form, warmth_tier: e.target.value })}
                className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1"
              >
                {WARMTH_TIERS.map(t => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </select>
            ) : (
              <span className={`px-3 py-1 text-sm rounded-full ${tierColor} text-white`}>
                {contact.warmth_tier.replace('_', ' ')}
              </span>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          {editing ? (
            <button onClick={handleSave} className="p-2 bg-green-600 rounded hover:bg-green-500">
              <Save className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={() => setEditing(true)} className="p-2 bg-zinc-800 rounded hover:bg-zinc-700">
              <Edit className="w-5 h-5" />
            </button>
          )}
          <button onClick={handleDelete} className="p-2 bg-zinc-800 rounded hover:bg-red-600">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-4">
        {contact.emails?.length > 0 && (
          <div className="flex items-center gap-3 text-zinc-300">
            <Mail className="w-5 h-5 text-zinc-500" />
            <span>{contact.emails[0].email}</span>
          </div>
        )}
        
        {contact.current_company && (
          <div className="flex items-center gap-3 text-zinc-300">
            <Building className="w-5 h-5 text-zinc-500" />
            {editing ? (
              <input
                type="text"
                value={form.current_company || ''}
                onChange={(e) => setForm({ ...form, current_company: e.target.value })}
                className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1"
                placeholder="Company"
              />
            ) : (
              <span>{contact.current_company} {contact.job_title && `• ${contact.job_title}`}</span>
            )}
          </div>
        )}
        
        {contact.how_we_met && (
          <div className="flex items-start gap-3 text-zinc-300">
            <Calendar className="w-5 h-5 text-zinc-500 mt-0.5" />
            <span>Met: {contact.how_we_met}</span>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="mt-8">
        <h2 className="text-lg font-medium mb-3">Notes</h2>
        {editing ? (
          <textarea
            value={form.notes || ''}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full h-32 bg-zinc-900 border border-zinc-700 rounded p-3"
            placeholder="Add notes..."
          />
        ) : (
          <p className="text-zinc-400">{contact.notes || 'No notes yet'}</p>
        )}
      </div>
    </div>
  );
}
