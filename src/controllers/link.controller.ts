import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import QRCode from 'qrcode';
import { supabase } from '../config/supabase';

// Create a new short link
export const createShortLink = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { originalUrl, customAlias, generateQr } = req.body;
    const shortCode = customAlias || nanoid(7);

    const { data: link, error } = await supabase
      .from('links')
      .insert({
        user_id: req.user.id,
        original_url: originalUrl,
        short_code: shortCode
      })
      .select()
      .single();

    if (error) return res.status(400).json({ message: error.message });

    const shortUrl = `${process.env.BASE_URL}/${link.short_code}`;
    let qrGenerated = false;

    if (generateQr) {
      const qrBase64 = await QRCode.toDataURL(shortUrl, {
        type: 'image/png',
        width: 512,
        margin: 2
      });

      await supabase.from('links').update({ qr_code: qrBase64 }).eq('id', link.id);
      qrGenerated = true;
    }

    res.status(201).json({
      ...link,
      short_url: shortUrl,
      qr_generated: qrGenerated
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get stats for a single link
export const getLinkStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { id } = req.params; // short_code
    const { data: link, error: linkError } = await supabase
      .from('links')
      .select('id, short_code, click_count')
      .eq('short_code', id)
      .eq('user_id', req.user.id)
      .single();

    if (linkError || !link) return res.status(404).json({ message: 'Link not found' });

    const { data: clicks, error: clicksError } = await supabase
      .from('clicks')
      .select('created_at')
      .eq('link_id', link.id)
      .order('created_at', { ascending: true });

    if (clicksError) return res.status(400).json({ message: clicksError.message });

    res.json({
      link_id: link.id,
      short_code: link.short_code,
      total_clicks: link.click_count,
      click_times: clicks.map(c => c.created_at)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch link statistics' });
  }
};

// Update a link
export const updateLink = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { id } = req.params; // short_code
    const { originalUrl, customAlias, regenerateQr } = req.body;

    const { data: existingLink, error: fetchError } = await supabase
      .from('links')
      .select('*')
      .eq('short_code', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !existingLink) return res.status(404).json({ message: 'Link not found' });

    const updatedData: any = {};
    if (originalUrl) updatedData.original_url = originalUrl;
    if (customAlias) updatedData.short_code = customAlias;

    const { data: updatedLink, error: updateError } = await supabase
      .from('links')
      .update(updatedData)
      .eq('id', existingLink.id)
      .select()
      .single();

    if (updateError) return res.status(400).json({ message: updateError.message });

    const shortUrl = `${process.env.BASE_URL}/${updatedLink.short_code}`;

    if (regenerateQr) {
      const qrBase64 = await QRCode.toDataURL(shortUrl, {
        type: 'image/png',
        width: 512,
        margin: 2
      });
      await supabase.from('links').update({ qr_code: qrBase64 }).eq('id', updatedLink.id);
    }

    res.json({
      message: 'Link updated successfully',
      ...updatedLink,
      short_url: shortUrl
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update link' });
  }
};

// Delete a link
export const deleteLink = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { id } = req.params;

    const { data: existingLink, error: fetchError } = await supabase
      .from('links')
      .select('id')
      .eq('short_code', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !existingLink) return res.status(404).json({ message: 'Link not found' });

    const { error: deleteError } = await supabase
      .from('links')
      .delete()
      .eq('id', existingLink.id);

    if (deleteError) return res.status(400).json({ message: deleteError.message });

    res.json({ message: 'Link deleted successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete link' });
  }
};

// Get all links for the authenticated user
export const getMyLinks = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { data: links, error } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ message: error.message });

    // Return just the array for frontend
    const formattedLinks = links.map(link => ({
      ...link,
      short_url: `${process.env.BASE_URL}/${link.short_code}`
    }));

    res.json(formattedLinks);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch links' });
  }
};
