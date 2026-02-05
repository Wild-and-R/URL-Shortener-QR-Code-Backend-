import express from 'express';
import { supabase } from '../config/supabase';

const router = express.Router();

router.get('/:code', async (req, res) => {
  const { code } = req.params;

  const { data: link } = await supabase
    .from('links')
    .select('*')
    .eq('short_code', code)
    .single();

  if (!link) {
    return res.status(404).send('Link not found');
  }

  await supabase.from('clicks').insert({
  link_id: link.id,
  ip_address: req.ip,
  user_agent: req.headers['user-agent'],
  });


  await supabase
    .from('links')
    .update({ click_count: link.click_count + 1 })
    .eq('id', link.id);

  res.redirect(link.original_url);
});

export default router;
