"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const supabase_auth_1 = require("../config/supabase.auth");
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data, error } = await supabase_auth_1.authSupabase.auth.getUser(token);
    if (error || !data.user) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = {
        id: data.user.id,
        email: data.user.email ?? '',
    };
    next();
};
exports.authenticate = authenticate;
