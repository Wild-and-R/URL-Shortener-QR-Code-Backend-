import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  if (!data.user) {
    return res.status(500).json({ error: 'User creation failed' });
  }

  // Create profile row
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: data.user.id,
      email,
    });

  if (profileError) {
    return res.status(500).json({ error: profileError.message });
  }

  return res.json({
    message: 'Register success',
    user: data.user,
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session || !data.user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  return res.json({
    access_token: data.session.access_token,
    user: data.user,
  });
};
