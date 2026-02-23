"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadQrPng = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const supabase_1 = require("../config/supabase");
const downloadQrPng = async (req, res) => {
    try {
        const { id } = req.params;
        const { data: link, error } = await supabase_1.supabase
            .from('links')
            .select('short_code')
            .eq('id', id)
            .single();
        if (error || !link) {
            return res.status(404).json({ message: 'Link not found' });
        }
        const shortUrl = `${process.env.BASE_URL}/${link.short_code}`;
        // Generate QR dynamically
        const qrBuffer = await qrcode_1.default.toBuffer(shortUrl, {
            type: 'png',
            width: 512,
            margin: 2
        });
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="qr-${link.short_code}.png"`);
        res.send(qrBuffer);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to generate QR code' });
    }
};
exports.downloadQrPng = downloadQrPng;
