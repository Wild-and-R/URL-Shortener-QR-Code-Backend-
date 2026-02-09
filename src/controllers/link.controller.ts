import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import QRCode from 'qrcode';
import { supabase } from '../config/supabase';

export const createShortLink = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

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

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const shortUrl = `${process.env.BASE_URL}/${link.short_code}`;

    let qrGenerated = false;

    // Only generate QR if requested
    if (generateQr === true) {
      const qrBase64 = await QRCode.toDataURL(shortUrl, {
        type: 'image/png',
        width: 512,
        margin: 2
      });

      await supabase
        .from('links')
        .update({ qr_code: qrBase64 })
        .eq('id', link.id);

      qrGenerated = true;
    }

    res.status(201).json({
      ...link,
      short_url: shortUrl,
      qr_generated: qrGenerated
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLinkStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params; // short_code

    // Get the link (ownership check)
    const { data: link, error: linkError } = await supabase
      .from('links')
      .select('id, short_code, click_count')
      .eq('short_code', id)
      .eq('user_id', req.user.id)
      .single();

    if (linkError || !link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    // Get click timestamps
    const { data: clicks, error: clicksError } = await supabase
      .from('clicks')
      .select('created_at')
      .eq('link_id', link.id)
      .order('created_at', { ascending: true });

    if (clicksError) {
      return res.status(400).json({ message: clicksError.message });
    }

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

