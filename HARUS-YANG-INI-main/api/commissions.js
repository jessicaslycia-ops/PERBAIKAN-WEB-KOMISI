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
      const { data, error } = await supabase
        .from('commissions_v3')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data || []);
    }
    if (req.method === 'POST') {
      const { name, reference_link, pose_outfit, notes, sfw, nsfw } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Name is required' });
      }
      const { data, error } = await supabase
        .from('commissions_v3')
        .insert({ name: name.trim(), reference_link, pose_outfit, notes, sfw: !!sfw, nsfw: !!nsfw, checked: false, accepted: false, progress: 0 })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, checked, accepted, name, reference_link, pose_outfit, notes, sfw, nsfw, progress } = req.body;
      const updateData = {};
      if (checked !== undefined) updateData.checked = checked;
      if (accepted !== undefined) updateData.accepted = accepted;
      if (name !== undefined) updateData.name = name;
      if (reference_link !== undefined) updateData.reference_link = reference_link;
      if (pose_outfit !== undefined) updateData.pose_outfit = pose_outfit;
      if (notes !== undefined) updateData.notes = notes;
      if (sfw !== undefined) updateData.sfw = sfw;
      if (nsfw !== undefined) updateData.nsfw = nsfw;
      if (progress !== undefined) updateData.progress = Math.max(0, Math.min(100, progress));
      const { data, error } = await supabase
        .from('commissions_v3')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase
        .from('commissions_v3')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
}
