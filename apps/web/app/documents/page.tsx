'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { LiquidButton } from '@/components/ui/LiquidButton';
import { supabase } from '@/lib/supabase/client';
import { useClients } from '@/hooks/useClients';

export default function DocumentsPage() {
  const { clients } = useClients();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    const clientId = clients[0]?.id;
    if (!file || !clientId || !supabase) return;

    setUploading(true);
    setMessage('Uploading...');

    const path = `${clientId}/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from('documents').upload(path, file, { upsert: false });

    if (error) {
      setMessage(error.message);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(data.path);

    await supabase.from('documents').insert({
      client_id: clientId,
      file_url: publicUrlData.publicUrl,
    });

    setMessage('Uploaded and saved to documents table');
    setUploading(false);
  }

  return (
    <div className="max-w-2xl">
      <GlassCard className="space-y-4">
        <h2 className="text-xl font-semibold">Document Storage</h2>
        <p className="text-sm text-slate-300">Upload a document to Supabase Storage bucket `documents` and store the URL in `documents` table.</p>
        <input type="file" onChange={handleUpload} disabled={uploading} className="block w-full rounded-xl border border-white/20 bg-white/5 p-2" />
        {message ? <p className="text-sm text-cyan-100">{message}</p> : null}
        <LiquidButton disabled>Bucket: documents</LiquidButton>
      </GlassCard>
    </div>
  );
}
