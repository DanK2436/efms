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
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    </div>
                    <h2 class="title-3d">EFMS Dashboard</h2>
                    <p class="subtitle-3d">Accès Administrateur</p>
                    <div id="auth-error" class="auth-error">Identifiants incorrects</div>
                    <form id="login-form">
                        <div class="form-group input-3d-group">
                            <label>Identifiant</label>
                            <input type="email" id="username" placeholder="exemple@dankande.com" required>
                        </div>
                        <div class="form-group input-3d-group" style="position:relative;">
                            <label>Mot de passe</label>
                            <div style="position:relative;">
                                <input type="password" id="password" placeholder="********" required style="padding-right: 80px;">
                                <button type="button" id="togglePassword" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); background:rgba(124, 207, 43, 0.1); border:1px solid var(--neon-green); color:var(--neon-green); padding:5px 10px; border-radius:8px; cursor:pointer; font-size:0.7rem; font-weight:800; z-index:10; transition:all 0.3s ease;">VOIR</button>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary w-100 btn-3d" id="login-btn">Se Connecter</button>
                    </form>
                </div>
            </div>
        </div>
    `,
    DashboardLayout: (content) => `
        <div class="admin-layout fade-in">
            <aside class="admin-sidebar">
                <div class="sidebar-header">
                    <img src="../assets/images/logo_efms.jpeg" alt="EFMS" class="sidebar-logo">
                    <h3 style="font-size:1.2rem; font-weight:800;">EFMS <span>Admin</span></h3>
                </div>
                <ul class="sidebar-menu">
                    <li class="sidebar-item">
                        <a class="sidebar-link active" id="link-stats" onclick="Admin.switchTab('stats')">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18M7 16V10M11 16V6M15 16V12M19 16V8"/></svg>
                            <span>Statistiques</span>
                        </a>
                    </li>
                    <li class="sidebar-item">
                        <a class="sidebar-link" id="link-annonces" onclick="Admin.switchTab('annonces')">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"/></svg>
                            <span>Annonces</span>
                        </a>
                    </li>
                    <li class="sidebar-item">
                        <a class="sidebar-link" id="link-reviews" onclick="Admin.switchTab('reviews')">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/></svg>
                            <span>Avis Clients</span>
                        </a>
                    </li>
                    <li class="sidebar-item">
                        <a class="sidebar-link" id="link-requests" onclick="Admin.switchTab('requests')">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6"/></svg>
                            <span>Demandes</span>
                        </a>
                    </li>
                </ul>
                </ul>
            </aside>
            <main class="admin-main">
                <header class="admin-header">
                    <h2 id="page-title">Tableau de <span>Bord</span></h2>
                    <div class="user-actions" style="display:flex; align-items:center; gap:20px;">
                        <div class="user-profile" style="display:flex; align-items:center; gap:10px;">
                            <span style="font-size:0.9rem; color:var(--text-muted)"><strong>Guelord Kasumpa</strong></span>
                            <div style="width:35px; height:35px; background:var(--neon-green); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#000; font-weight:800;">GK</div>
                        </div>
                        <button onclick="Admin.logout()" class="btn btn-danger btn-sm" style="padding: 0.5rem 1rem; border-radius: 8px; font-weight:700;">Déconnexion</button>
                    </div>
                </header>
                <div id="tab-content">${content}</div>
            </main>
        </div>
    `,
    Stats: `
        <div class="stats-grid">
            <div class="stat-card">
                <h3 id="visits-day">0</h3>
                <p>Aujourd'hui</p>
            </div>
            <div class="stat-card">
                <h3 id="visits-week">0</h3>
                <p>Semaine</p>
            </div>
            <div class="stat-card">
                <h3 id="visits-month">0</h3>
                <p>Mois</p>
            </div>
            <div class="stat-card">
                <h3 id="visits-year">0</h3>
                <p>Année</p>
            </div>
        </div>
        <div class="admin-card stats-chart-card fade-in">
            <h3>Analyse de Trafic</h3>
            <div class="chart-container" style="position: relative; height:300px; width:100%;">
                <canvas id="visitorChart"></canvas>
            </div>
        </div>
        <div class="admin-card">
            <h3>Flux de Visiteurs en Temps Réel</h3>
            <div id="visitsList" style="margin-top:1.5rem;"></div>
        </div>
    `,
    Annonces: `
        <div style="display:flex; justify-content:flex-start; margin-bottom:3rem; margin-top:1rem;">
            <button class="btn btn-primary" onclick="Admin.toggleAnnonceForm()" style="padding: 0.8rem 1.5rem; font-size: 0.9rem;">
                + Ajouter une nouvelle annonce
            </button>
        </div>

        <div class="admin-card fade-in" id="annonce-form-card" style="display:none;">
            <h3>Publier une Annonce</h3>
            <form id="adminForm" style="margin-top:1.5rem;">
                <div class="form-group" style="margin-bottom:1.5rem;">
                    <label>Titre de l'annonce</label>
                    <input type="text" id="titre" placeholder="Titre accrocheur..." required>
                </div>
                <div class="form-group" style="margin-bottom:1.5rem;">
                    <label>Contenu</label>
                    <textarea id="contenu" placeholder="Détails de l'annonce..." rows="4" required></textarea>
                </div>
                <div class="form-group" style="margin-bottom:2rem;">
                    <label>Média (Image/Vidéo)</label>
                    <div class="file-upload-wrapper">
                        <div class="file-upload-design">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom:10px;"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                            <p id="file-label">Cliquez ou déposez un fichier ici</p>
                            <small>(Images ou Vidéos uniquement)</small>
                        </div>
                        <input type="file" id="media" accept="image/*,video/*" onchange="document.getElementById('file-label').textContent = this.files[0].name">
                    </div>
                </div>
                <div style="display:flex; gap:10px;">
                    <button type="submit" class="btn btn-primary" id="btn-publier" style="padding:1rem 2rem;">Publier Maintenant</button>
                    <button type="button" class="btn btn-secondary" onclick="Admin.toggleAnnonceForm()" style="padding:1rem 2rem;">Annuler</button>
                </div>
                <div id="admin-feedback" style="margin-top:1rem;"></div>
            </form>
        </div>
        <div class="admin-card">
            <h3>Annonces Actives</h3>
            <div id="adminList" style="margin-top:1.5rem;"></div>
        </div>
    `,
    Reviews: `
        <div class="admin-card">
            <h3>Modération des Avis</h3>
            <div id="reviewsAdminList" style="margin-top:1.5rem;"></div>
        </div>
    `,
    Requests: `
        <div class="admin-card">
            <h3>Demandes de Devis Reçues</h3>
            <div id="requestsList" style="margin-top:1.5rem;"></div>
        </div>
    `
};

// --- ROUTAGE ---
const Router = {
    isLoggedIn: () => localStorage.getItem('efms_logged_in') === 'true',
    setLogin: (status) => localStorage.setItem('efms_logged_in', status),

    navigate: () => {
        if (Router.isLoggedIn()) Router.renderDashboard();
        else Router.renderLogin();
    },

    renderLogin: () => {
        document.body.classList.add('login-mode');
        appContainer.innerHTML = Views.Login;
        
        // Password Toggle Logic
        const toggleBtn = document.getElementById('togglePassword');
        const passInput = document.getElementById('password');
        if (toggleBtn && passInput) {
            toggleBtn.addEventListener('click', () => {
                const isPass = passInput.type === 'password';
                passInput.type = isPass ? 'text' : 'password';
                toggleBtn.textContent = isPass ? 'MASQUER' : 'VOIR';
                toggleBtn.style.background = isPass ? 'var(--neon-green)' : 'rgba(124, 207, 43, 0.1)';
                toggleBtn.style.color = isPass ? '#000' : 'var(--neon-green)';
            });
        }
        
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const u = document.getElementById('username').value;
            const p = document.getElementById('password').value;
            const btn = document.getElementById('login-btn');
            const err = document.getElementById('auth-error');
            
            btn.textContent = 'Authentification...';
            btn.disabled = true;

            try {
                const encU = encodeURIComponent(u);
                const encP = encodeURIComponent(p);
                const res = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encU}&password=eq.${encP}`, {
                    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
                });
                const users = await res.json();

                if (users && users.length > 0) {
                    Router.setLogin('true');
                    Router.navigate();
                } else {
                    throw new Error('Identifiants incorrects');
                }
            } catch (error) {
                err.style.display = 'block';
                btn.textContent = 'Envoi...';
                btn.disabled = false;
            }
        });
    },

    renderDashboard: () => {
        document.body.classList.remove('login-mode');
        // Initial load with Stats
        appContainer.innerHTML = Views.DashboardLayout(Views.Stats);
        Admin.loadStats();
        Admin.bindSidebar();
    }
};

// --- LOGIQUE ADMIN ---
const Admin = {
    bindSidebar: () => {
        // No need for specific link binding if we use onclick in HTML, 
        // but let's handle the "active" state classes
    },

    switchTab: (tab) => {
        const content = document.getElementById('tab-content');
        const title = document.getElementById('page-title');
        
        // Update Links
        document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
        const activeLink = document.getElementById(`link-${tab}`);
        if (activeLink) activeLink.classList.add('active');

        if (tab === 'stats') {
            title.innerHTML = 'Tableau de <span>Bord</span>';
            content.innerHTML = Views.Stats;
            Admin.loadStats();
        } else if (tab === 'annonces') {
            title.innerHTML = 'Gestion des <span>Annonces</span>';
            content.innerHTML = Views.Annonces;
            Admin.loadAnnonces();
            // Re-bind form
            setTimeout(() => {
                const f = document.getElementById('adminForm');
                if (f) f.addEventListener('submit', Admin.publishAnnonce);
            }, 0);
        } else if (tab === 'reviews') {
            title.innerHTML = 'Modération des <span>Avis</span>';
            content.innerHTML = Views.Reviews;
            Admin.loadReviews();
        } else if (tab === 'requests') {
            title.innerHTML = 'Demandes de <span>Devis</span>';
            content.innerHTML = Views.Requests;
            Admin.loadRequests();
        }
    },

    loadStats: async () => {
        const list = document.getElementById('visitsList');
        if (!list) return;
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/visits?select=*&order=created_at.desc`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });
            const visits = await res.json();
            
            const now = new Date();
            const sDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const sWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
            const sMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const sYear = new Date(now.getFullYear(), 0, 1);

            document.getElementById('visits-day').textContent = visits.filter(v => new Date(v.created_at) >= sDay).length;
            document.getElementById('visits-week').textContent = visits.filter(v => new Date(v.created_at) >= sWeek).length;
            document.getElementById('visits-month').textContent = visits.filter(v => new Date(v.created_at) >= sMonth).length;
            document.getElementById('visits-year').textContent = visits.filter(v => new Date(v.created_at) >= sYear).length;

            // Generate Chart data (last 7 days)
            Admin.initChart(visits);

            list.innerHTML = '';
            visits.slice(0, 15).forEach(v => {
                const div = document.createElement('div');
                div.style.padding = "1rem"; div.style.borderBottom = "1px solid rgba(255,255,255,0.05)";
                div.style.display = "flex"; div.style.justifyContent = "space-between";
                div.innerHTML = `
                    <span><strong>${v.page}</strong> <br> <small style="color:var(--text-muted)">${v.user_agent.substring(0, 50)}...</small></span>
                    <small style="color:var(--neon-green)">${new Date(v.created_at).toLocaleString()}</small>
                `;
                list.appendChild(div);
            });
        } catch (e) { console.error(e); }
    },

    loadAnnonces: async () => {
        const list = document.getElementById('adminList');
        if (!list) return;
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/annonces?select=*&order=created_at.desc`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });
            const data = await res.json();
            list.innerHTML = data.length === 0 ? '<p>Aucune annonce active.</p>' : '';
            data.forEach(a => {
                const div = document.createElement('div');
                div.className = 'admin-item';
                div.style.display = "flex"; div.style.justifyContent = "space-between"; div.style.padding = "1.5rem"; div.style.marginBottom = "1rem";
                div.innerHTML = `
                    <div>
                        <h4 style="margin:0;">${a.titre}</h4>
                        <small style="color:var(--neon-green)">Publiée le ${new Date(a.created_at).toLocaleDateString()}</small>
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="Admin.deleteItem('annonces', '${a.id}')">Supprimer</button>
                `;
                list.appendChild(div);
            });
        } catch (e) { console.error(e); }
    },

    publishAnnonce: async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-publier');
        const fb = document.getElementById('admin-feedback');
        btn.disabled = true; btn.textContent = 'Publication en cours...';

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
                body: JSON.stringify({ titre, contenu, media_url: mediaUrl, media_type: file ? (file.type.startsWith('video') ? 'video' : 'image') : null })
            });

            fb.innerHTML = "<span style='color:var(--neon-green)'>Annonce publiée avec succès !</span>";
            document.getElementById('adminForm').reset();
            Admin.loadAnnonces();
        } catch (e) { fb.innerHTML = "<span style='color:var(--danger)'>Erreur lors de la publication.</span>"; }
        btn.disabled = false; btn.textContent = 'Publier Maintenant';
    },

    loadReviews: async () => {
        const list = document.getElementById('reviewsAdminList');
        if (!list) return;
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/reviews?select=*&order=created_at.desc`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });
            const data = await res.json();
            list.innerHTML = data.length === 0 ? '<p>Aucun avis client à modérer.</p>' : '';
            data.forEach(r => {
                const div = document.createElement('div');
                div.className = 'admin-item';
                div.style.marginBottom = '1.5rem'; div.style.padding = '1.5rem';
                div.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <h4 style="margin:0;">${r.nom} <span style="color:#ffc107;">${'★'.repeat(r.note)}</span></h4>
                            <small>${new Date(r.created_at).toLocaleDateString()}</small>
                        </div>
                        <div style="display:flex; gap:10px;">
                            <button class="btn btn-sm ${r.approuve ? 'btn-secondary' : 'btn-primary'}" onclick="Admin.toggleReview('${r.id}', ${!r.approuve})">
                                ${r.approuve ? 'Masquer' : 'Approuver'}
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="Admin.deleteItem('reviews', '${r.id}')">Supprimer</button>
                        </div>
                    </div>
                    <p style="margin-top:15px; font-style:italic;">"${r.commentaire}"</p>
                `;
                list.appendChild(div);
            });
        } catch (e) { console.error(e); }
    },

    toggleReview: async (id, status) => {
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/reviews?id=eq.${id}`, {
                method: 'PATCH',
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ approuve: status })
            });
            Admin.loadReviews();
        } catch (e) { console.error(e); }
    },

    loadRequests: async () => {
        const list = document.getElementById('requestsList');
        if (!list) return;
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/requests?select=*&order=created_at.desc`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });
            const data = await res.json();
            list.innerHTML = data.length === 0 ? '<p>Aucune demande de devis.</p>' : '';
            data.forEach(r => {
                const div = document.createElement('div');
                div.className = 'admin-item';
                div.style.marginBottom = '1.5rem'; div.style.padding = '1.5rem';
                div.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h4 style="margin:0; color:var(--neon-green)">${r.nom} <small style="color:var(--text-muted)">(${r.service || 'Devis'})</small></h4>
                        <button class="btn btn-danger btn-sm" onclick="Admin.deleteItem('requests', '${r.id}')">Archiver</button>
                    </div>
                    <div style="margin:15px 0;">
                        <strong>Véhicule:</strong> ${r.vehicule || 'N/A'}<br>
                        <strong>Description:</strong> ${r.message}
                    </div>
                    <small style="color:var(--text-muted)">Contact: ${r.email} | ${r.telephone || 'N/A'}</small>
                `;
                list.appendChild(div);
            });
        } catch (e) { console.error(e); }
    },

    deleteItem: async (table, id) => {
        if (!confirm("Voulez-vous vraiment supprimer cet élément ?")) return;
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
                method: 'DELETE',
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });
            if (table === 'annonces') Admin.loadAnnonces();
            else if (table === 'reviews') Admin.loadReviews();
            else Admin.loadRequests();
        } catch (e) { alert("Erreur lors de la suppression."); }
    },

    logout: () => {
        Router.setLogin('false');
        window.location.reload();
    },

    toggleAnnonceForm: () => {
        const container = document.getElementById('annonce-form-card');
        if (container) {
            const isHidden = container.style.display === 'none';
            container.style.display = isHidden ? 'block' : 'none';
        }
    },

    initChart: (visits) => {
        const ctx = document.getElementById('visitorChart');
        if (!ctx) return;
        
        // Group by day for last 7 days
        const labels = [];
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
            labels.push(dateStr);
            
            const count = visits.filter(v => {
                const vDate = new Date(v.created_at);
                return vDate.getDate() === date.getDate() && vDate.getMonth() === date.getMonth();
            }).length;
            data.push(count);
        }

        if (window.myChart) window.myChart.destroy();

        window.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Visiteurs',
                    data: data,
                    borderColor: '#7ccf2b',
                    backgroundColor: 'rgba(124, 207, 43, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#7ccf2b',
                    pointBorderColor: '#fff',
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: 'rgba(255,255,255,0.5)' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: 'rgba(255,255,255,0.5)' }
                    }
                }
            }
        });
    }
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    Router.navigate();
});

// For global scope exposure
window.Admin = Admin;
window.Router = Router;
