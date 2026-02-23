"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const link_routes_1 = __importDefault(require("./routes/link.routes"));
const redirect_routes_1 = __importDefault(require("./routes/redirect.routes"));
const app = (0, express_1.default)();
const cors = require('cors');
app.use(express_1.default.json());
app.use(cors({
    origin: "https://linkzip-zeta.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use('/api/auth', auth_routes_1.default);
app.use('/api/links', link_routes_1.default);
app.use('/r', redirect_routes_1.default);
exports.default = app;
