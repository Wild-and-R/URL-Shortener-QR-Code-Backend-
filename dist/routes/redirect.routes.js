"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const supabase_1 = require("../config/supabase");
const router = express_1.default.Router();
router.get('/:code', async (req, res) => {
    const { code } = req.params;
    const { data: link } = await supabase_1.supabase
        .from('links')
        .select('*')
        .eq('short_code', code)
        .single();
    if (!link) {
        return res.status(404).send('Link not found');
    }
    // Track click
    await supabase_1.supabase.from('clicks').insert({
        link_id: link.id,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
    });
    await supabase_1.supabase
        .from('links')
        .update({ click_count: link.click_count + 1 })
        .eq('id', link.id);
    // Load HTML template
    const filePath = path_1.default.join(__dirname, '../views/redirect.html');
    let html = fs_1.default.readFileSync(filePath, 'utf8');
    // Inject URL
    html = html.replace(/{{URL}}/g, link.original_url);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
});
exports.default = router;
