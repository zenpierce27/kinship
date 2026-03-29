'use client';

import { useEffect, useState } from 'react';
import { supabase, Person, TIER_COLORS } from '@/lib/supabase';
import { Search, User, Building, Calendar } from 'lucide-react';

export default function Home() {
  const [contacts, setContacts] = useState<Person[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  async function loadContacts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('persons')
      .select('*')
      .is('archived_at', null)
      .order('updated_at', { ascending: false });
    
    if (!error && data) {
      setContacts(data);
    }
    setLoading(false);
  }

  const filtered = contacts.filter(c => 
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.current_company?.toLowerCase().includes(search.toLowerCase()) ||
    c.job_title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-pink-500"
        />
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-6 text-sm text-zinc-500">
        <span>{contacts.length} contacts</span>
        {search && <span>• {filtered.length} matches</span>}
      </div>

      {/* Contact List */}
      {loading ? (
        <div className="text-zinc-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-zinc-500">No contacts found</div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>
      )}
    </div>
  );
}

function ContactCard({ contact }: { contact: Person }) {
  const tierColor = TIER_COLORS[contact.warmth_tier] || 'bg-zinc-500';
  const lastContact = contact.last_contact_at 
    ? new Date(contact.last_contact_at).toLocaleDateString()
    : null;

  return (
    <a 
      href={`/contact/${contact.id}`}
      className="block p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className={`w-12 h-12 rounded-full ${tierColor} flex items-center justify-center text-white font-medium`}>
          {contact.full_name.charAt(0)}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">{contact.full_name}</h3>
            <span className={`px-2 py-0.5 text-xs rounded-full ${tierColor} text-white`}>
              {contact.warmth_tier.replace('_', ' ')}
            </span>
          </div>
          
          {contact.current_company && (
            <div className="flex items-center gap-1 text-sm text-zinc-400 mt-1">
              <Building className="w-3 h-3" />
              <span>{contact.current_company}</span>
              {contact.job_title && <span>• {contact.job_title}</span>}
            </div>
          )}
          
          {lastContact && (
            <div className="flex items-center gap-1 text-xs text-zinc-500 mt-1">
              <Calendar className="w-3 h-3" />
              <span>Last contact: {lastContact}</span>
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
