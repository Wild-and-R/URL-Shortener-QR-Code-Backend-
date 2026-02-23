"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const link_controller_1 = require("../controllers/link.controller");
const qr_controller_1 = require("../controllers/qr.controller");
const router = express_1.default.Router();
router.post('/', auth_1.authenticate, link_controller_1.createShortLink);
router.get('/:id/qr', auth_1.authenticate, qr_controller_1.downloadQrPng);
router.get('/:id/stats', auth_1.authenticate, link_controller_1.getLinkStats);
router.put('/:id', auth_1.authenticate, link_controller_1.updateLink);
router.delete('/:id', auth_1.authenticate, link_controller_1.deleteLink);
router.get('/mylinks', auth_1.authenticate, link_controller_1.getMyLinks);
exports.default = router;
