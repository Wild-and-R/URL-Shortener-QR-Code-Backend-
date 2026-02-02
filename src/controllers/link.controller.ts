import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { supabase } from '../config/supabase';

export const createShortLink = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { originalUrl, customAlias } = req.body;

    const shortCode = customAlias || nanoid(7);

    const { data, error } = await supabase
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

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
