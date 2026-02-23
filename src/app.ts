import express from 'express';
import authRoutes from './routes/auth.routes';
import linkRoutes from './routes/link.routes';
import redirectRoutes from './routes/redirect.routes';


const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors({
  origin: "https://linkzip-zeta.vercel.app",
  methods: ["GET","POST","PUT","DELETE"],
  credentials: true
}));

app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);
app.use('/r', redirectRoutes);

export default app;
