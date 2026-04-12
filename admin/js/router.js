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
                            <input type="password" id="password" placeholder="********" required>
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
                <button class="tab-btn" id="tab-reviews" onclick="Admin.switchTab('reviews')">Modération des Avis</button>
                <button class="tab-btn" id="tab-demandes" onclick="Admin.switchTab('demandes')">Demandes Clients</button>
                <button class="tab-btn" id="tab-stats" onclick="Admin.switchTab('stats')">Statistiques Visites</button>
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

            <div id="section-reviews" style="display:none;">
                <div class="admin-list">
                    <h3>Modération des Avis Clients</h3>
                    <div id="reviewsAdminList" style="margin-top:1.5rem;"></div>
                </div>
            </div>

            <div id="section-demandes" style="display:none;">
                <div class="admin-list">
                    <h3>Demandes de Devis Reçues</h3>
                    <div id="requestsList" style="margin-top:1.5rem;"></div>
                </div>
            </div>

            <div id="section-stats" style="display:none;">
                <div class="admin-panel">
                    <h3>Statistiques de Visites</h3>
                    <div id="stats-summary" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:1rem; margin-top:2rem;">
                        <div class="admin-item" style="text-align:center;">
                            <h2 id="visits-day" style="color:var(--primary)">0</h2>
                            <p>Aujourd'hui</p>
                        </div>
                        <div class="admin-item" style="text-align:center;">
                            <h2 id="visits-week" style="color:var(--primary)">0</h2>
                            <p>Cette Semaine</p>
                        </div>
                        <div class="admin-item" style="text-align:center;">
                            <h2 id="visits-month" style="color:var(--primary)">0</h2>
                            <p>Ce Mois</p>
                        </div>
                        <div class="admin-item" style="text-align:center;">
                            <h2 id="visits-year" style="color:var(--primary)">0</h2>
                            <p>Cette Année</p>
                        </div>
                    </div>
                </div>
                <div class="admin-panel" style="margin-top:2rem;">
                    <h3>Dernières Visites</h3>
                    <div id="visitsList" style="margin-top:1.5rem;"></div>
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
                const encodedEmail = encodeURIComponent(u);
                const encodedPass = encodeURIComponent(p);
                const res = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodedEmail}&password=eq.${encodedPass}`, {
                    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
                });
                const users = await res.json();

                if (users && users.length > 0) {
                    Router.setLogin('true');
                    Router.navigate();
                } else {
                    console.error("Login failed: User not found in database.");
                    throw new Error('Identifiants incorrects');
                }
            } catch (error) {
                console.error("Auth error:", error);
                err.style.display = 'block';
                btn.textContent = 'Se Connecter';
                btn.disabled = false;
            }
        });
    },

    renderDashboard: () => {
        document.body.classList.remove('login-mode');
        subtitle.textContent = "Gérez les annonces, les avis, les visites et consultez les demandes des clients.";
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

        const form = document.getElementById('adminForm');
        if (form) form.addEventListener('submit', Admin.publishAnnonce);
        
        Admin.loadAnnonces();
    },

    switchTab: (tab) => {
        const tAnnonces = document.getElementById('tab-annonces');
        const tReviews = document.getElementById('tab-reviews');
        const tDemandes = document.getElementById('tab-demandes');
        const tStats = document.getElementById('tab-stats');
        
        const sAnnonces = document.getElementById('section-annonces');
        const sReviews = document.getElementById('section-reviews');
        const sDemandes = document.getElementById('section-demandes');
        const sStats = document.getElementById('section-stats');

        // Reset
        [tAnnonces, tReviews, tDemandes, tStats].forEach(t => t.classList.remove('active'));
        [sAnnonces, sReviews, sDemandes, sStats].forEach(s => s.style.display = 'none');

        if (tab === 'annonces') {
            tAnnonces.classList.add('active'); sAnnonces.style.display = 'block';
            Admin.loadAnnonces();
            setTimeout(() => {
                const f = document.getElementById('adminForm');
                if (f) f.addEventListener('submit', Admin.publishAnnonce);
            }, 0);
        } else if (tab === 'reviews') {
            tReviews.classList.add('active'); sReviews.style.display = 'block';
            Admin.loadReviews();
        } else if (tab === 'stats') {
            tStats.classList.add('active'); sStats.style.display = 'block';
            Admin.loadStats();
        } else {
            tDemandes.classList.add('active'); sDemandes.style.display = 'block';
            Admin.loadRequests();
        }
    },

    loadAnnonces: async () => {
        const list = document.getElementById('adminList');
        if (!list) return;
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

    loadReviews: async () => {
        const list = document.getElementById('reviewsAdminList');
        if (!list) return;
        list.innerHTML = '<p>Chargement...</p>';
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/reviews?select=*&order=created_at.desc`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });
            const data = await res.json();
            list.innerHTML = data.length === 0 ? '<div>Aucun avis client.</div>' : '';
            data.forEach(r => {
                const div = document.createElement('div');
                div.className = 'admin-item glass-panel';
                div.style.marginBottom = '1rem'; 
                div.style.borderLeft = r.approuve ? '4px solid var(--primary)' : '4px solid #f39c12';
                
                div.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <h4 style="margin:0;">${r.nom} <span style="color:#ffc107;">${'★'.repeat(r.note)}</span></h4>
                            <small>${new Date(r.created_at).toLocaleDateString()}</small>
                        </div>
                        <div style="display:flex; gap:0.5rem;">
                            <button class="btn btn-sm ${r.approuve ? 'btn-secondary' : 'btn-primary'}" 
                                onclick="Admin.toggleReview('${r.id}', ${!r.approuve})">
                                ${r.approuve ? 'Cacher' : 'Approuver'}
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="Admin.deleteItem('reviews', '${r.id}')">Supprimer</button>
                        </div>
                    </div>
                    <div style="margin-top:10px; font-style:italic; font-size:0.9rem;">"${r.commentaire}"</div>
                `;
                list.appendChild(div);
            });
        } catch (e) { list.innerHTML = 'Erreur de chargement avis.'; }
    },

    toggleReview: async (id, status) => {
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/reviews?id=eq.${id}`, {
                method: 'PATCH',
                headers: { 
                    'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ approuve: status })
            });
            Admin.loadReviews();
        } catch (e) { alert("Erreur modération."); }
    },

    loadStats: async () => {
        const list = document.getElementById('visitsList');
        if (!list) return;
        list.innerHTML = '<p>Analyse des données...</p>';
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/visits?select=*&order=created_at.desc`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });
            const visits = await res.json();
            
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfYear = new Date(now.getFullYear(), 0, 1);

            const dayVisits = visits.filter(v => new Date(v.created_at) >= startOfDay).length;
            const weekVisits = visits.filter(v => new Date(v.created_at) >= startOfWeek).length;
            const monthVisits = visits.filter(v => new Date(v.created_at) >= startOfMonth).length;
            const yearVisits = visits.filter(v => new Date(v.created_at) >= startOfYear).length;

            document.getElementById('visits-day').textContent = dayVisits;
            document.getElementById('visits-week').textContent = weekVisits;
            document.getElementById('visits-month').textContent = monthVisits;
            document.getElementById('visits-year').textContent = yearVisits;

            list.innerHTML = '';
            visits.slice(0, 20).forEach(v => {
                const div = document.createElement('div');
                div.className = 'admin-item glass-panel';
                div.style.marginBottom = '0.5rem'; div.style.padding = '1rem'; div.style.fontSize = '0.85rem';
                div.innerHTML = `
                    <div style="display:flex; justify-content:space-between;">
                        <span><strong>Page:</strong> ${v.page}</span>
                        <small>${new Date(v.created_at).toLocaleString()}</small>
                    </div>
                    <div style="color:var(--text-muted); font-size:0.75rem; margin-top:5px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                        ${v.user_agent}
                    </div>
                `;
                list.appendChild(div);
            });
        } catch (e) { list.innerHTML = 'Erreur stats.'; }
    },

    loadRequests: async () => {
        const list = document.getElementById('requestsList');
        if (!list) return;
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
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
                method: 'DELETE',
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });
            if (table === 'annonces') Admin.loadAnnonces();
            else if (table === 'reviews') Admin.loadReviews();
            else Admin.loadRequests();
        } catch (e) { alert("Erreur lors de la suppression."); }
    }
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    Router.navigate();
});

// For global onclick handlers
window.Admin = Admin;
window.Router = Router;
