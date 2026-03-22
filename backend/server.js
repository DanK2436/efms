require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn("Please provide SUPABASE_URL and SUPABASE_KEY in .env");
}

const adminUser = process.env.ADMIN_USERNAME || 'admin';
const adminPass = process.env.ADMIN_PASSWORD || 'monmotdepasseadmin';
const adminToken = 'efms-admin-secure-token-2026';

// Middleware d'authentification pour sécuriser les routes Admin
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token === adminToken) {
    next();
  } else {
    return res.status(401).json({ error: 'Accès non autorisé' });
  }
};

// Multer configured for memory so we can read file buffer and upload to Supabase Storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ===== LOGIN ADMIN =====
app.post('/api/login', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase client not configured' });
  const { username, password } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', username)
      .eq('password', password) // In production, use bcrypt.compare() with hashed password
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    res.status(200).json({ token: adminToken, message: 'Login réussi' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// ===== DEMANDES DES UTILISATEURS (CONTACT FORM) =====

// Recevoir la demande de l'utilisateur
app.post('/api/requests', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase client not configured' });
  const { nom, email, telephone, vehicule, service, message } = req.body;
  
  if (!nom || !email || !message) {
    return res.status(400).json({ error: 'Nom, email et message sont obligatoires.' });
  }

  try {
    const { data, error } = await supabase
      .from('requests')
      .insert([{ nom, email, telephone, vehicule, service, message, created_at: new Date().toISOString() }]);

    if (error) throw error;
    res.status(201).json({ message: 'Demande enregistrée avec succès', data });
  } catch (err) {
    console.error("Error inserting request:", err);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement de la demande' });
  }
});

// Admin : Voir les demandes des utilisateurs (Protégé)
app.get('/api/requests', authMiddleware, async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase client not configured' });
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des demandes' });
  }
});

// Admin : Marquer une demande comme lue ou supprimée (Protégé)
app.delete('/api/requests/:id', authMiddleware, async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase client not configured' });
  const { id } = req.params;
  try {
    const { data, error } = await supabase.from('requests').delete().eq('id', id);
    if (error) throw error;
    res.status(200).json({ message: 'Demande supprimée' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// ===== ANNONCES =====

// Admin : Poster une annonce (texte + media) (Protégé)
app.post('/api/annonces', authMiddleware, upload.single('media'), async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase client not configured' });
  
  const { titre, contenu } = req.body;
  if (!titre || !contenu) {
    return res.status(400).json({ error: 'Titre et contenu sont obligatoires.' });
  }

  let mediaUrl = null;
  let mediaType = null;

  try {
    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const contentType = req.file.mimetype;
      
      // Upload to supabase storage bucket "annonces-media"
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('annonces-media')
        .upload(fileName, req.file.buffer, {
          contentType: contentType,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('annonces-media')
        .getPublicUrl(fileName);
        
      mediaUrl = publicUrlData.publicUrl;
      mediaType = contentType.startsWith('video/') ? 'video' : 'image';
    }

    const newAnnonce = {
      titre,
      contenu,
      media_url: mediaUrl,
      media_type: mediaType,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('annonces')
      .insert([newAnnonce]);

    if (error) throw error;
    res.status(201).json({ message: 'Annonce publiée avec succès', data });

  } catch (err) {
    console.error("Error creating annonce:", err);
    res.status(500).json({ error: 'Erreur lors de la publication de l\'annonce' });
  }
});

// Public : Voir les annonces
app.get('/api/annonces', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase client not configured' });
  try {
    const { data, error } = await supabase
      .from('annonces')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des annonces' });
  }
});

// Admin : Supprimer une annonce (Protégé)
app.delete('/api/annonces/:id', authMiddleware, async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase client not configured' });
  const { id } = req.params;
  try {
    // Ideally delete media from storage too, skipping for MVP
    const { data, error } = await supabase.from('annonces').delete().eq('id', id);
    if (error) throw error;
    res.status(200).json({ message: 'Annonce supprimée' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

app.listen(port, () => {
  console.log(`Backend EFMS API running on http://localhost:${port}`);
});
