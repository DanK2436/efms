const API_URL = 'http://localhost:3000/api';
const appContainer = document.getElementById('app-container');
const subtitle = document.getElementById('admin-subtitle');
const nav = document.getElementById('admin-nav');

// --- TÉMPLATES DES VUES ---
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
                    <p class="subtitle-3d">Accès Sécurisé</p>
                    
                    <div id="auth-error" class="auth-error">Identifiants incorrects</div>
                    
                    <form id="login-form">
                        <div class="form-group input-3d-group">
                            <label for="username">Identifiant</label>
                            <input type="email" id="username" placeholder="votre@email.com" required autocomplete="email">
                        </div>
                        <div class="form-group input-3d-group">
                            <label for="password">Mot de passe</label>
                            <input type="password" id="password" placeholder="Mot de passe" required autocomplete="current-password">
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

            <!-- TAB ANNONCES -->
            <div id="section-annonces">
                <div class="admin-panel" style="margin-bottom:2.5rem;">
                    <h3>Publier une nouvelle annonce</h3>
                    <form id="adminForm" enctype="multipart/form-data">
                        <div class="form-group">
                            <label for="titre">Titre de l'annonce</label>
                            <input type="text" id="titre" placeholder="Ex: Promotion -20% sur les reprogrammations ECU" required>
                        </div>
                        <div class="form-group">
                            <label for="contenu">Contenu de l'annonce</label>
                            <textarea id="contenu" placeholder="Rédigez le contenu détaillé de votre annonce..." rows="4" required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="media">Importer une vidéo ou image (Optionnel)</label>
                            <input type="file" id="media" name="media" accept="image/*,video/*" style="border:1px solid #333; padding: 0.5rem; width: 100%; border-radius:4px; background:rgba(255,255,255,0.05);">
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

            <!-- TAB DEMANDES -->
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
    getToken: () => localStorage.getItem('efms_admin_token'),
    setToken: (token) => localStorage.setItem('efms_admin_token', token),
    removeToken: () => localStorage.removeItem('efms_admin_token'),

    navigate: () => {
        const token = Router.getToken();
        if (token) {
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
            
            err.style.display = 'none';
            btn.textContent = 'Connexion...';
            btn.disabled = true;

            try {
                const res = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: u, password: p })
                });

                if (!res.ok) throw new Error('Bad credentials');
                
                const data = await res.json();
                Router.setToken(data.token);
                Router.navigate(); // load dashboard
            } catch (error) {
                err.style.display = 'block';
                btn.textContent = 'Se Connecter';
                btn.disabled = false;
            }
        });
    },

    renderDashboard: () => {
        document.body.classList.remove('login-mode');
        subtitle.textContent = "Gérez les annonces et consultez les demandes des clients.";
        nav.style.display = 'flex';
        appContainer.innerHTML = Views.Dashboard;
        
        // Initialize Admin Logic
        Admin.init();
    }
};

// --- LOGIQUE ADMIN (Tableau de bord) ---
const Admin = {
    init: () => {
        document.getElementById('nav-logout').addEventListener('click', (e) => {
            e.preventDefault();
            Router.removeToken();
            Router.navigate();
        });

        const form = document.getElementById('adminForm');
        form.addEventListener('submit', Admin.publishAnnonce);

        Admin.loadAnnonces();
    },

    switchTab: (tab) => {
        const tAnnonces = document.getElementById('tab-annonces');
        const tDemandes = document.getElementById('tab-demandes');
        const sAnnonces = document.getElementById('section-annonces');
        const sDemandes = document.getElementById('section-demandes');

        if (tab === 'annonces') {
            tAnnonces.classList.add('active');
            tDemandes.classList.remove('active');
            sAnnonces.style.display = 'block';
            sDemandes.style.display = 'none';
            Admin.loadAnnonces();
        } else {
            tDemandes.classList.add('active');
            tAnnonces.classList.remove('active');
            sDemandes.style.display = 'block';
            sAnnonces.style.display = 'none';
            Admin.loadRequests();
        }
    },

    // A helper to make authorized fetch requests
    authFetch: async (endpoint, options = {}) => {
        const token = Router.getToken();
        if (!options.headers) options.headers = {};
        
        // Do not set Content-Type if it's FormData, let the browser handle boundaries
        if (!(options.body instanceof FormData)) {
            if (!options.headers['Content-Type']) {
                options.headers['Content-Type'] = 'application/json';
            }
        }

        options.headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_URL}${endpoint}`, options);
        if (res.status === 401) {
            Router.removeToken();
            Router.navigate();
            throw new Error("Session expirée");
        }
        return res;
    },

    loadAnnonces: async () => {
        const list = document.getElementById('adminList');
        list.innerHTML = '<p>Chargement des annonces...</p>';
        try {
            const res = await fetch(`${API_URL}/annonces`);
            if (!res.ok) throw new Error("Erreur serveur");
            const annonces = await res.json();
            
            list.innerHTML = '';
            if (annonces.length === 0) {
                list.innerHTML = '<div style="color:var(--text-muted)">Aucune annonce publiée.</div>';
                return;
            }
            
            annonces.forEach(a => {
                const div = document.createElement('div');
                div.className = 'admin-item glass-panel';
                div.style.display = "flex";
                div.style.justifyContent = "space-between";
                div.style.alignItems = "center";
                div.style.marginBottom = "1.5rem";

                const mediaPreview = a.media_url ? 
                    (a.media_type === 'video' ? 
                        `<div style="width:60px; height:45px; background:#000; border-radius:4px; margin-right:15px; display:flex; align-items:center; justify-content:center;"><svg width="20" height="20" viewBox="0 0 24 24" fill="var(--primary)"><path d="M8 5v14l11-7z"/></svg></div>` : 
                        `<img src="${a.media_url}" style="width:60px; height:45px; object-fit:cover; border-radius:4px; margin-right:15px; border:1px solid rgba(255,255,255,0.1);">`) : 
                    '<div style="width:60px; height:45px; background:rgba(255,255,255,0.05); border-radius:4px; margin-right:15px;"></div>';

                div.innerHTML = `
                    <div style="display:flex; align-items:center;">
                        ${mediaPreview}
                        <div>
                            <h4 style="margin:0; color:var(--text)">${a.titre}</h4>
                            <div style="color:var(--primary); font-size:0.85rem; margin-top:0.3rem;">${dateStr}</div>
                        </div>
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="Admin.deleteAnnonce('${a.id}')">Supprimer</button>
                `;
                list.appendChild(div);
            });
        } catch (err) {
            list.innerHTML = '<div style="color:var(--danger)">Serveur inaccessible. API Node éteinte ?</div>';
        }
    },

    publishAnnonce: async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-publier');
        const fb = document.getElementById('admin-feedback');
        btn.textContent = 'Envoi...';
        btn.disabled = true;

        const formData = new FormData();
        formData.append('titre', document.getElementById('titre').value);
        formData.append('contenu', document.getElementById('contenu').value);
        
        const media = document.getElementById('media').files[0];
        if (media) formData.append('media', media);

        try {
            const res = await Admin.authFetch('/annonces', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error("Erreur création");

            fb.textContent = "✅ Annonce publiée !";
            fb.style.color = "var(--primary)";
            document.getElementById('adminForm').reset();
            Admin.loadAnnonces();
        } catch (err) {
            if(err.message !== "Session expirée") {
                fb.textContent = "❌ Echec (Vérifiez le serveur / la BDD)";
                fb.style.color = "var(--danger)";
            }
        } finally {
            btn.textContent = "Publier l'annonce";
            btn.disabled = false;
        }
    },

    deleteAnnonce: async (id) => {
        if(!confirm("Supprimer l'annonce définitivement ?")) return;
        try {
            await Admin.authFetch(`/annonces/${id}`, { method: 'DELETE' });
            Admin.loadAnnonces();
        } catch (err) {
            console.error(err);
        }
    },

    loadRequests: async () => {
        const list = document.getElementById('requestsList');
        list.innerHTML = '<p>Chargement des requêtes...</p>';
        try {
            const res = await Admin.authFetch('/requests');
            const reqs = await res.json();

            list.innerHTML = '';
            if (reqs.length === 0) {
                list.innerHTML = '<div style="color:var(--text-muted)">Aucune demande pour le moment.</div>';
                return;
            }

            reqs.forEach(r => {
                const div = document.createElement('div');
                div.className = 'admin-item glass-panel';
                div.style.marginBottom = '1.5rem';
                div.style.borderLeft = '4px solid var(--primary)';
                
                div.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
                        <div>
                            <h4 style="margin:0; color:var(--text);">${r.nom}</h4>
                            <small style="color:var(--primary); font-weight:bold;">${r.service ? r.service.toUpperCase() : 'Non spécifié'} - ${r.vehicule || 'N/A'}</small>
                        </div>
                        <div style="text-align:right;">
                            <small style="color:var(--text-muted)">${new Date(r.created_at).toLocaleDateString()}</small><br>
                            <button class="btn btn-danger btn-sm" style="margin-top:0.5rem; padding: 0.3rem 0.6rem; font-size:0.8rem;" onclick="Admin.deleteRequest('${r.id}')">Archiver</button>
                        </div>
                    </div>
                    <div style="display:flex; gap:1.5rem; font-size:0.9rem; margin-bottom:1rem; flex-wrap:wrap;">
                        <span>📧 <a href="mailto:${r.email}" style="color:var(--text)">${r.email}</a></span>
                        <span>📞 <a href="tel:${r.telephone}" style="color:var(--text)">${r.telephone || 'N/A'}</a></span>
                    </div>
                    <div style="background:rgba(255,255,255,0.05); padding:1rem; border-radius:4px; font-size:0.95rem; line-height:1.5;">
                        ${r.message}
                    </div>
                `;
                list.appendChild(div);
            });

        } catch (err) {
            list.innerHTML = '<div style="color:var(--danger)">Serveur inaccessible ou vous devez être reconnecté.</div>';
        }
    },

    deleteRequest: async (id) => {
        if(!confirm("Archiver et supprimer cette demande ?")) return;
        try {
            await Admin.authFetch(`/requests/${id}`, { method: 'DELETE' });
            Admin.loadRequests();
        } catch (err) {
            console.error(err);
        }
    }
};

// Bootstrap application
document.addEventListener('DOMContentLoaded', () => {
    Router.navigate();
});
