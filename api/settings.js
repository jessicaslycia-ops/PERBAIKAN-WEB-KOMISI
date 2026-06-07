import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('Vary', '*');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { key } = req.query;
      if (key) {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('key', key)
          .single();
        if (error && error.code !== 'PGRST116') throw error;
        return res.status(200).json(data || { key, value: '' });
      }
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .order('key', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data || []);
    }
    if (req.method === 'POST' || req.method === 'PUT') {
      const { key, value } = req.body;
      if (!key) return res.status(400).json({ error: 'Key is required' });
      const { data, error } = await supabase
        .from('settings')
        .upsert({ key, value: value || '' }, { onConflict: 'key' })
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { key } = req.body;
      const { error } = await supabase
        .from('settings')
        .delete()
        .eq('key', key);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
}
