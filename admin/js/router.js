// CONFIGURATION SUPABASE
const SUPABASE_URL = 'https://fgjbcvczxrzkffeqfndk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnamJjdmN6eHJ6a2ZmZXFmbmRrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDE4NDcyNSwiZXhwIjoyMDg5NzYwNzI1fQ.UiAriYMyR449hHmoTu3OJMkwvCrt_QbEqs7FWU0IZ7w';

const appContainer = document.getElementById('app-container');
const subtitle = document.getElementById('admin-subtitle');
const nav = document.getElementById('admin-nav');

// --- TEMPLATES DES VUES ---
const Views = {
    Login: `
        <div class="login-wrapper fade-in">
            <div class="glow-orb orb-1"></div>
            <div class="glow-orb orb-2"></div>
            <div class="login-box card-3d">
                <div class="card-edge-highlight"></div>
                <div class="login-content">
                    <div class="logo-3d">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                    </div>
                    <h2 class="title-3d">EFMS Portal</h2>
                    <p class="subtitle-3d">Accès Sécurisé (Supabase)</p>
                    <div id="auth-error" class="auth-error">Identifiants incorrects</div>
                    <form id="login-form">
                        <div class="form-group input-3d-group">
                            <label for="username">Identifiant</label>
                            <input type="email" id="username" placeholder="admin@efms.outlook.com" required>
                        </div>
                        <div class="form-group input-3d-group">
                            <label for="password">Mot de passe</label>
                            <input type="password" id="password" placeholder="••••••••" required>
                        </div>
                        <button type="submit" class="btn btn-primary w-100 btn-3d" id="login-btn">Initialiser la session</button>
                    </form>
                </div>
            </div>
        </div>
    `,
    Dashboard: `
        <div class="fade-in">
            <div class="admin-tabs">
                <button class="tab-btn active" id="tab-annonces" onclick="Admin.switchTab('annonces')">Gestion des Annonces</button>
                <button class="tab-btn" id="tab-demandes" onclick="Admin.switchTab('demandes')">Demandes Clients</button>
            </div>
            <div id="section-annonces">
                <div class="admin-panel" style="margin-bottom:2.5rem;">
                    <h3>Publier une nouvelle annonce</h3>
                    <form id="adminForm">
                        <div class="form-group">
                            <label for="titre">Titre de l'annonce</label>
                            <input type="text" id="titre" placeholder="Ex: Promotion -20%..." required>
                        </div>
                        <div class="form-group">
                            <label for="contenu">Contenu de l'annonce</label>
                            <textarea id="contenu" placeholder="Détails..." rows="4" required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="media">Importer une image (Optionnel)</label>
                            <input type="file" id="media" accept="image/*" style="border:1px solid #333; padding: 0.5rem; width: 100%; border-radius:4px; background:rgba(255,255,255,0.05);">
                        </div>
                        <button type="submit" class="btn btn-primary" id="btn-publier">Publier l'annonce</button>
                        <div id="admin-feedback" style="margin-top:1rem; font-weight:bold;"></div>
                    </form>
                </div>
                <div class="admin-list">
                    <h3>Annonces publiées</h3>
                    <div id="adminList" style="margin-top:1.5rem;"></div>
                </div>
            </div>
            <div id="section-demandes" style="display:none;">
                <div class="admin-list">
                    <h3>Demandes de Devis Reçues</h3>
                    <div id="requestsList" style="margin-top:1.5rem;"></div>
                </div>
            </div>
        </div>
    `
};

// --- ROUTAGE & AUTHENTIFICATION ---
const Router = {
    isLoggedIn: () => localStorage.getItem('efms_logged_in') === 'true',
    setLogin: (status) => localStorage.setItem('efms_logged_in', status),

    navigate: () => {
        if (Router.isLoggedIn()) {
            Router.renderDashboard();
        } else {
            Router.renderLogin();
        }
    },

    renderLogin: () => {
        document.body.classList.add('login-mode');
        subtitle.textContent = "Veuillez vous authentifier pour accéder au portail.";
        nav.style.display = 'none';
        appContainer.innerHTML = Views.Login;
        
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const u = document.getElementById('username').value;
            const p = document.getElementById('password').value;
            const btn = document.getElementById('login-btn');
            const err = document.getElementById('auth-error');
            
            btn.textContent = 'Vérification...';
            btn.disabled = true;

            try {
                // Vérification manuelle dans la table users (selon votre script SQL)
                const res = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${u}&password=eq.${p}`, {
                    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
                });
                const users = await res.json();

                if (users.length > 0) {
                    Router.setLogin('true');
                    Router.navigate();
                } else {
                    throw new Error('Identifiants incorrects');
                }
            } catch (error) {
                err.style.display = 'block';
                btn.textContent = 'Se Connecter';
                btn.disabled = false;
            }
        });
    },

    renderDashboard: () => {
        document.body.classList.remove('login-mode');
        subtitle.textContent = "Gérez les annonces et consultez les demandes des clients (Supabase).";
        nav.style.display = 'flex';
        appContainer.innerHTML = Views.Dashboard;
        Admin.init();
    }
};

// --- LOGIQUE ADMIN ---
const Admin = {
    init: () => {
        document.getElementById('nav-logout').addEventListener('click', (e) => {
            e.preventDefault();
            Router.setLogin('false');
            Router.navigate();
        });

        document.getElementById('adminForm').addEventListener('submit', Admin.publishAnnonce);
        Admin.loadAnnonces();
    },

    switchTab: (tab) => {
        const tAnnonces = document.getElementById('tab-annonces');
        const tDemandes = document.getElementById('tab-demandes');
        const sAnnonces = document.getElementById('section-annonces');
        const sDemandes = document.getElementById('section-demandes');

        if (tab === 'annonces') {
            tAnnonces.classList.add('active'); tDemandes.classList.remove('active');
            sAnnonces.style.display = 'block'; sDemandes.style.display = 'none';
            Admin.loadAnnonces();
        } else {
            tDemandes.classList.add('active'); tAnnonces.classList.remove('active');
            sDemandes.style.display = 'block'; sAnnonces.style.display = 'none';
            Admin.loadRequests();
        }
    },

    loadAnnonces: async () => {
        const list = document.getElementById('adminList');
        list.innerHTML = '<p>Chargement...</p>';
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/annonces?select=*&order=created_at.desc`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });
            const data = await res.json();
            list.innerHTML = data.length === 0 ? '<div>Aucune annonce.</div>' : '';
            data.forEach(a => {
                const div = document.createElement('div');
                div.className = 'admin-item glass-panel';
                div.style.display = "flex"; div.style.justifyContent = "space-between"; div.style.marginBottom = "1rem";
                div.innerHTML = `
                    <div>
                        <h4 style="margin:0;">${a.titre}</h4>
                        <small style="color:var(--primary)">${new Date(a.created_at).toLocaleDateString()}</small>
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="Admin.deleteItem('annonces', '${a.id}')">Supprimer</button>
                `;
                list.appendChild(div);
            });
        } catch (e) { list.innerHTML = 'Erreur de chargement.'; }
    },

    publishAnnonce: async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-publier');
        const fb = document.getElementById('admin-feedback');
        btn.disabled = true; btn.textContent = 'Envoi...';

        const titre = document.getElementById('titre').value;
        const contenu = document.getElementById('contenu').value;
        const file = document.getElementById('media').files[0];
        let mediaUrl = null;

        try {
            if (file) {
                const fileName = `${Date.now()}_${file.name}`;
                const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/annonces-media/${fileName}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${SUPABASE_KEY}`, 'apikey': SUPABASE_KEY },
                    body: file
                });
                if (uploadRes.ok) mediaUrl = `${SUPABASE_URL}/storage/v1/object/public/annonces-media/${fileName}`;
            }

            await fetch(`${SUPABASE_URL}/rest/v1/annonces`, {
                method: 'POST',
                headers: { 
                    'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json', 'Prefer': 'return=minimal' 
                },
                body: JSON.stringify({ titre, contenu, media_url: mediaUrl, media_type: file ? 'image' : null })
            });

            fb.textContent = "Annonce publiée !"; fb.style.color = "var(--primary)";
            document.getElementById('adminForm').reset();
            Admin.loadAnnonces();
        } catch (e) { fb.textContent = "Erreur de publication."; fb.style.color = "var(--danger)"; }
        btn.disabled = false; btn.textContent = 'Publier l\'annonce';
    },

    loadRequests: async () => {
        const list = document.getElementById('requestsList');
        list.innerHTML = '<p>Chargement...</p>';
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/requests?select=*&order=created_at.desc`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });
            const data = await res.json();
            list.innerHTML = data.length === 0 ? '<div>Aucune demande.</div>' : '';
            data.forEach(r => {
                const div = document.createElement('div');
                div.className = 'admin-item glass-panel';
                div.style.marginBottom = '1rem'; div.style.borderLeft = '4px solid var(--primary)';
                div.innerHTML = `
                    <div style="display:flex; justify-content:space-between;">
                        <h4>${r.nom} <small>(${r.service || 'Devis'})</small></h4>
                        <button class="btn btn-danger btn-sm" onclick="Admin.deleteItem('requests', '${r.id}')">Archiver</button>
                    </div>
                    <p style="font-size:0.9rem; margin:10px 0;">${r.message}</p>
                    <small>${r.email} | ${r.telephone || 'N/A'}</small>
                `;
                list.appendChild(div);
            });
        } catch (e) { list.innerHTML = 'Erreur de chargement.'; }
    },

    deleteItem: async (table, id) => {
        if (!confirm("Confirmer la suppression ?")) return;
        await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
            method: 'DELETE',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        table === 'annonces' ? Admin.loadAnnonces() : Admin.loadRequests();
    }
};

document.addEventListener('DOMContentLoaded', () => Router.navigate());