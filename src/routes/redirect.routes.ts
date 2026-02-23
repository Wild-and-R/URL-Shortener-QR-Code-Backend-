import express from 'express';
import { supabase } from '../config/supabase';

const router = express.Router();

// Helper to return redirect HTML
const redirectTemplate = (url: string) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Redirecting | LinkZip</title>
    <meta http-equiv="refresh" content="3;url=${url}" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        background: #f8fafc;
        height: 100vh;
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .card {
        background: white;
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(108, 92, 231, 0.15);
        max-width: 480px;
        width: 90%;
        text-align: center;
        border: 1px solid #e2e8f0;
      }
      .logo {
        font-size: 26px;
        font-weight: 900;
        color: #6c5ce7;
        letter-spacing: -0.5px;
        margin-bottom: 20px;
      }
      .logo span { color: #94a3b8; }
      h2 { margin: 0; font-size: 22px; font-weight: 700; color: #0f172a; }
      .url { word-break: break-all; color: #6c5ce7; font-size: 14px; margin: 16px 0; padding: 10px; background: #f1f5f9; border-radius: 12px; }
      .hint { font-size: 14px; color: #64748b; margin-top: 8px; }
      .button { display: inline-block; margin-top: 18px; padding: 10px 18px; background: #6c5ce7; color: white; font-weight: 600; border-radius: 999px; text-decoration: none; transition: all 0.2s ease; box-shadow: 0 10px 20px rgba(108, 92, 231, 0.25); }
      .button:hover { background: #5b4cc4; transform: translateY(-2px); }
      .countdown { margin-top: 12px; font-weight: 600; color: #6c5ce7; }
    </style>
    <script>
      let seconds = 3;
      function updateCountdown() {
        const el = document.getElementById("countdown");
        if (el) el.innerText = seconds;
        seconds--;
        if (seconds >= 0) setTimeout(updateCountdown, 1000);
      }
      window.onload = updateCountdown;
    </script>
  </head>
  <body>
    <div class="card">
      <div class="logo">Link<span>Zip</span></div>
      <h2>You're being redirected</h2>
      <p class="url">${url}</p>
      <p class="hint">Redirecting in <span id="countdown" class="countdown">3</span> seconds...</p>
      <a href="${url}" class="button">Go Now</a>
    </div>
  </body>
</html>
`;

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

  // Track click
  await supabase.from('clicks').insert({
    link_id: link.id,
    ip_address: req.ip,
    user_agent: req.headers['user-agent'],
  });

  await supabase
    .from('links')
    .update({ click_count: link.click_count + 1 })
    .eq('id', link.id);

  // Send redirect HTML
  res.setHeader('Content-Type', 'text/html');
  res.send(redirectTemplate(link.original_url));
});

export default router;
