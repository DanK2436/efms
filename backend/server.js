require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret.length < 32) {
  console.error('FATAL: JWT_SECRET must be set in .env (min 32 characters).');
  process.exit(1);
}

const corsOrigins = (process.env.CORS_ORIGINS || 'https://efms-kolwezi.com,http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || corsOrigins.includes(origin) || corsOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(new Error('CORS blocked'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '100kb' }));

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('Please provide SUPABASE_URL and SUPABASE_KEY in .env');
}

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (ALLOWED_MIME.has(file.mimetype)) cb(null, true);
    else cb(new Error('Type de fichier non autorisé'));
  },
});

/** Simple in-memory rate limiter */
function rateLimit({ windowMs, max, keyFn }) {
  const hits = new Map();
  return (req, res, next) => {
    const key = keyFn(req);
    const now = Date.now();
    let bucket = hits.get(key);
    if (!bucket || now > bucket.reset) {
      bucket = { count: 0, reset: now + windowMs };
      hits.set(key, bucket);
    }
    bucket.count += 1;
    if (bucket.count > max) {
      return res.status(429).json({ error: 'Trop de requêtes. Réessayez plus tard.' });
    }
    return next();
  };
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyFn: (req) => `login:${req.ip}`,
});
const publicWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  keyFn: (req) => `write:${req.ip}`,
});

function signAdminToken(user) {
  return jwt.sign(
    { sub: user.id || user.email, email: user.email, role: 'admin' },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' },
  );
}

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Accès non autorisé' });
  }
  try {
    req.admin = jwt.verify(token, jwtSecret);
    return next();
  } catch (_err) {
    return res.status(401).json({ error: 'Session expirée ou invalide' });
  }
};

function clampStr(value, max) {
  if (value == null) return value;
  return String(value).slice(0, max);
}

function isBcryptHash(value) {
  return typeof value === 'string' && /^\$2[aby]\$/.test(value);
}

async function verifyAndMaybeUpgradePassword(user, password) {
  const stored = user.password;
  if (!stored) return false;

  if (isBcryptHash(stored)) {
    return bcrypt.compare(password, stored);
  }

  // Legacy plaintext row: verify then upgrade hash (one-time migration).
  const ok = stored === password;
  if (ok && supabase && user.id) {
    const hash = await bcrypt.hash(password, 12);
    await supabase.from('users').update({ password: hash }).eq('id', user.id);
  }
  return ok;
}

// ===== LOGIN ADMIN =====
app.post('/api/login', loginLimiter, async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase client not configured' });
  const username = clampStr(req.body?.username, 200);
  const password = req.body?.password;

  if (!username || typeof password !== 'string' || password.length < 1 || password.length > 200) {
    return res.status(400).json({ error: 'Identifiants invalides' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, password')
      .eq('email', username)
      .maybeSingle();

    if (error || !data) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const valid = await verifyAndMaybeUpgradePassword(data, password);
    if (!valid) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const token = signAdminToken(data);
    return res.status(200).json({ token, message: 'Login réussi' });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// ===== DEMANDES =====
app.post('/api/requests', publicWriteLimiter, async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase client not configured' });
  const nom = clampStr(req.body?.nom, 120);
  const email = clampStr(req.body?.email, 200);
  const telephone = clampStr(req.body?.telephone, 40);
  const vehicule = clampStr(req.body?.vehicule, 120);
  const service = clampStr(req.body?.service, 80);
  const message = clampStr(req.body?.message, 4000);

  if (!nom || !email || !message) {
    return res.status(400).json({ error: 'Nom, email et message sont obligatoires.' });
  }

  try {
    const { data, error } = await supabase
      .from('requests')
      .insert([{ nom, email, telephone, vehicule, service, message, created_at: new Date().toISOString() }])
      .select();

    if (error) throw error;
    return res.status(201).json({ message: 'Demande enregistrée avec succès', data });
  } catch (err) {
    console.error('Error inserting request:', err);
    return res.status(500).json({ error: "Erreur lors de l'enregistrement de la demande" });
  }
});

app.get('/api/requests', authMiddleware, async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase client not configured' });
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Erreur lors de la récupération des demandes' });
  }
});

app.delete('/api/requests/:id', authMiddleware, async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase client not configured' });
  try {
    const { error } = await supabase.from('requests').delete().eq('id', req.params.id);
    if (error) throw error;
    return res.status(200).json({ message: 'Demande supprimée' });
  } catch (err) {
    return res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// ===== ANNONCES =====
app.post('/api/annonces', authMiddleware, (req, res) => {
  upload.single('media')(req, res, async (uploadErr) => {
    if (uploadErr) {
      return res.status(400).json({ error: uploadErr.message || 'Upload invalide' });
    }
    if (!supabase) return res.status(500).json({ error: 'Supabase client not configured' });

    const titre = clampStr(req.body?.titre, 200);
    const contenu = clampStr(req.body?.contenu, 8000);
    if (!titre || !contenu) {
      return res.status(400).json({ error: 'Titre et contenu sont obligatoires.' });
    }

    let mediaUrl = null;
    let mediaType = null;

    try {
      if (req.file) {
        const ext = (req.file.originalname.split('.').pop() || 'bin').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
        const fileName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext || 'bin'}`;

        const { error: uploadError } = await supabase.storage
          .from('annonces-media')
          .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('annonces-media')
          .getPublicUrl(fileName);

        mediaUrl = publicUrlData.publicUrl;
        mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
      }

      const { data, error } = await supabase
        .from('annonces')
        .insert([{
          titre,
          contenu,
          media_url: mediaUrl,
          media_type: mediaType,
          created_at: new Date().toISOString(),
        }])
        .select();

      if (error) throw error;
      return res.status(201).json({ message: 'Annonce publiée avec succès', data });
    } catch (err) {
      console.error('Error creating annonce:', err);
      return res.status(500).json({ error: "Erreur lors de la publication de l'annonce" });
    }
  });
});

app.get('/api/annonces', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase client not configured' });
  try {
    const { data, error } = await supabase
      .from('annonces')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Erreur lors de la récupération des annonces' });
  }
});

app.delete('/api/annonces/:id', authMiddleware, async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase client not configured' });
  try {
    const { error } = await supabase.from('annonces').delete().eq('id', req.params.id);
    if (error) throw error;
    return res.status(200).json({ message: 'Annonce supprimée' });
  } catch (err) {
    return res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// ===== REVIEWS =====
app.post('/api/reviews', publicWriteLimiter, async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase client not configured' });
  const nom = clampStr(req.body?.nom, 120);
  const commentaire = clampStr(req.body?.commentaire, 2000);
  const note = Number(req.body?.note);

  if (!nom || !commentaire || !Number.isFinite(note) || note < 1 || note > 5) {
    return res.status(400).json({ error: 'Nom, commentaire et note (1-5) sont obligatoires.' });
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([{ nom, commentaire, note, approuve: false, created_at: new Date().toISOString() }])
      .select();

    if (error) throw error;
    return res.status(201).json({ message: 'Avis envoyé avec succès. Il sera visible après modération.', data });
  } catch (err) {
    console.error('Error inserting review:', err);
    return res.status(500).json({ error: "Erreur lors de l'envoi de l'avis" });
  }
});

app.get('/api/reviews', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase client not configured' });
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('approuve', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Erreur lors de la récupération des avis' });
  }
});

app.get('/api/admin/reviews', authMiddleware, async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase client not configured' });
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Erreur lors de la récupération des avis' });
  }
});

app.patch('/api/reviews/:id', authMiddleware, async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase client not configured' });
  const approuve = Boolean(req.body?.approuve);
  try {
    const { error } = await supabase
      .from('reviews')
      .update({ approuve })
      .eq('id', req.params.id);

    if (error) throw error;
    return res.status(200).json({ message: "Statut de l'avis mis à jour" });
  } catch (err) {
    return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

app.delete('/api/reviews/:id', authMiddleware, async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase client not configured' });
  try {
    const { error } = await supabase.from('reviews').delete().eq('id', req.params.id);
    if (error) throw error;
    return res.status(200).json({ message: 'Avis supprimé' });
  } catch (err) {
    return res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// ===== VISITS =====
app.post('/api/visits', publicWriteLimiter, async (req, res) => {
  if (!supabase) return res.status(200).json({ message: 'Tracking skipped' });
  const page = clampStr(req.body?.page, 300) || '/';
  const user_agent = clampStr(req.body?.user_agent, 400) || '';
  try {
    await supabase.from('visits').insert([{ page, user_agent, created_at: new Date().toISOString() }]);
    return res.status(201).json({ message: 'Visit logged' });
  } catch (err) {
    return res.status(500).json({ error: 'Tracking error' });
  }
});

app.get('/api/admin/stats', authMiddleware, async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase client not configured' });
  try {
    const { data: visits, error } = await supabase
      .from('visits')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json(visits);
  } catch (err) {
    return res.status(500).json({ error: 'Erreur stats' });
  }
});

const keepAlive = async () => {
  if (!supabase) return;
  try {
    console.log('Supabase Keep-Alive Heartbeat...');
    await supabase.from('keep_alive').update({ last_ping: new Date().toISOString() }).eq('id', 1);
  } catch (err) {
    console.error('Keep-Alive Failed:', err);
  }
};

keepAlive();
setInterval(keepAlive, 24 * 60 * 60 * 1000);

app.listen(port, () => {
  console.log(`Backend EFMS API running on http://localhost:${port}`);
});
