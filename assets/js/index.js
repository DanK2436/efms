document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = (path) => (window.EFMS ? window.EFMS.apiUrl(path) : path);
    const escapeHtml = (v) => (window.EFMS ? window.EFMS.escapeHtml(v) : String(v ?? ''));

    // ===== Visit Tracking via backend only =====
    const logVisit = async () => {
        try {
            await fetch(apiUrl('/api/visits'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    page: window.location.pathname,
                    user_agent: navigator.userAgent
                })
            });
        } catch (e) { /* silent */ }
    };
    logVisit();

    // ===== Scroll Reveal =====
    const revealElements = document.querySelectorAll('[data-reveal]');
    const revealOnScroll = () => {
        revealElements.forEach((el, i) => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight - 80) {
                setTimeout(() => el.classList.add('active'), i * 80);
            }
        });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();

    // ===== Header Scroll Effect =====
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // ===== Counter Animation =====
    const counters = document.querySelectorAll('.hero-stat h3');
    let counterStarted = false;
    const animateCounters = () => {
        const heroStats = document.querySelector('.hero-stats');
        if (!heroStats || counterStarted) return;
        const rect = heroStats.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
            counterStarted = true;
            counters.forEach(counter => {
                const text = counter.textContent;
                const match = text.match(/(\d+)/);
                if (match) {
                    const target = parseInt(match[0]);
                    const suffix = text.replace(match[0], '');
                    let current = 0;
                    const increment = Math.ceil(target / 50);
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        counter.textContent = current + suffix;
                    }, 30);
                }
            });
        }
    };
    window.addEventListener('scroll', animateCounters);
    animateCounters();

    // ===== Contact Form =====
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const modal = document.createElement('div');
        modal.className = 'submission-modal';
        document.body.appendChild(modal);

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nom = document.getElementById('nom').value;
            const email = document.getElementById('email').value;
            const telephone = document.getElementById('telephone').value;
            const vehicule = document.getElementById('vehicule').value;
            const service = document.getElementById('service').value;
            const message = document.getElementById('message').value;

            let animationHTML = '';
            let processingText = 'Analyse de votre demande en cours...';

            if (service === 'calibrage') {
                processingText = 'Génération du dossier de calibrage...';
                animationHTML = `
                <div class="anim-service">
                    <div class="injector-anim"></div>
                    <div class="spray-anim"></div>
                </div>`;
            } else if (service === 'cles') {
                processingText = 'Cryptage et préparation de la requête...';
                animationHTML = `
                <div class="anim-service">
                    <div class="key-anim"></div>
                    <div class="signal-anim"></div>
                </div>`;
            } else if (service === 'diagnostic') {
                processingText = 'Analyse OBD et formatage des données...';
                animationHTML = `
                <div class="anim-service">
                    <div class="scanner-anim"></div>
                    <div class="scan-line-anim"></div>
                </div>`;
            } else {
                animationHTML = `
                <div class="anim-service">
                    <div class="gear-anim"></div>
                </div>`;
            }

            const logoSrc = document.querySelector('.logo img')?.getAttribute('src')
                || '../assets/brand/logo-efms-centered.png';

            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <img src="${escapeHtml(logoSrc)}" alt="EFMS" class="modal-logo">
                        <h3>Portail EFMS</h3>
                    </div>
                    <div class="modal-body">
                        ${animationHTML}
                        <h4 class="processing-text">${processingText}</h4>
                        <div class="progress-bar"><div class="progress-fill"></div></div>
                    </div>
                </div>
            `;
            modal.classList.add('active');

            const dateStr = new Date().toLocaleString('fr-FR');
            let bodyText = `=========================================================\n`;
            bodyText += `      NOUVELLE DEMANDE DE DEVIS - EFMS\n`;
            bodyText += `=========================================================\n\n`;
            bodyText += `Dossier généré le : ${dateStr}\n\n\n`;
            bodyText += `[ IDENTIFICATION DU CLIENT ]\n`;
            bodyText += `---------------------------------------------------------\n\n`;
            bodyText += `▸ Nom complet        :   ${nom}\n\n`;
            bodyText += `▸ Contact E-mail     :   ${email}\n\n`;
            bodyText += `▸ Contact Téléphone  :   ${telephone}\n\n\n`;
            bodyText += `[ PROFIL DU VÉHICULE & PRESTATION ]\n`;
            bodyText += `---------------------------------------------------------\n\n`;
            bodyText += `▸ Marque / Modèle    :   ${vehicule}\n\n`;
            bodyText += `▸ Type de Service    :   ${service ? service.toUpperCase() : 'Non spécifié'}\n\n\n`;
            bodyText += `[ DESCRIPTION DU DIAGNOSTIC / PROBLÈME ]\n`;
            bodyText += `---------------------------------------------------------\n\n`;
            bodyText += `${message}\n\n\n`;
            bodyText += `---------------------------------------------------------\n`;
            bodyText += `Ce document a été formaté automatiquement par le système EFMS.`;

            const mailTo = 'electronifullmultiservice@outlook.com';
            const subject = `[EFMS] Dossier #DEV-${Math.floor(Math.random() * 10000)} | ${nom} | ${service ? service.toUpperCase() : ''}`;

            setTimeout(async () => {
                const stepText = document.querySelector('.processing-text');
                const progressFill = document.querySelector('.progress-fill');

                stepText.innerHTML = 'Enregistrement de la demande sur les serveurs sécurisés...';
                progressFill.style.background = 'var(--primary)';

                const payload = { nom, email, telephone, vehicule, service, message };

                try {
                    const res = await fetch(apiUrl('/api/requests'), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (res.ok) {
                        handleSuccess(stepText);
                        return;
                    }
                    throw new Error('API error');
                } catch (err) {
                    handleError(stepText, mailTo, subject, bodyText);
                }
            }, 2500);

            function handleSuccess(stepText) {
                stepText.innerHTML = '<span style="color:var(--primary); font-weight:800;">[SUCCÈS]</span> Demande transmise avec succès ! Nous vous recontacterons sous peu.<br><span style="font-size:0.8rem; color:var(--text-muted); font-weight:normal; margin-top:10px; display:block;">Vous pouvez fermer cette fenêtre.</span>';
                setTimeout(() => {
                    modal.classList.remove('active');
                    contactForm.reset();
                }, 4000);
            }

            function handleError(stepText, mailToAddr, subjectText, body) {
                stepText.innerHTML = '<span style="color:var(--danger); font-weight:800;">[ALERTE]</span> Erreur réseau. Redirection vers votre messagerie de secours...<br><span style="font-size:0.8rem; color:var(--text-muted); font-weight:normal; margin-top:10px; display:block;">Cliquez sur "Envoyer" dans votre application mail.</span>';
                setTimeout(() => {
                    const link = `mailto:${mailToAddr}?subject=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(body)}`;
                    window.location.href = link;
                    setTimeout(() => {
                        modal.classList.remove('active');
                        contactForm.reset();
                    }, 3500);
                }, 2000);
            }
        });
    }

    // ===== Announcements =====
    const announcementsContainer = document.getElementById('announcements-list');
    const loadAnnouncements = async () => {
        if (!announcementsContainer) return;
        try {
            const res = await fetch(apiUrl('/api/annonces'));
            if (!res.ok) throw new Error('Erreur');
            const annonces = await res.json();

            if (annonces.length === 0) {
                announcementsContainer.innerHTML = '<div class="empty-state"><p>Aucune annonce pour le moment.</p></div>';
                return;
            }

            announcementsContainer.innerHTML = '';
            annonces.forEach(a => {
                const card = document.createElement('div');
                card.className = 'announcement-card';
                card.setAttribute('data-reveal', '');

                let mediaHTML = '';
                if (a.media_url) {
                    const safeUrl = escapeHtml(a.media_url);
                    if (a.media_type === 'video') {
                        mediaHTML = `
                        <div class="announcement-media">
                            <video controls class="media-content">
                                <source src="${safeUrl}" type="video/mp4">
                                Votre navigateur ne supporte pas la vidéo.
                            </video>
                        </div>`;
                    } else {
                        mediaHTML = `
                        <div class="announcement-media">
                            <img src="${safeUrl}" alt="${escapeHtml(a.titre)}" class="media-content">
                        </div>`;
                    }
                }

                card.innerHTML = `
                    <div class="announcement-content">
                        <h3>${escapeHtml(a.titre)}</h3>
                        <div class="announcement-date">${new Date(a.created_at).toLocaleDateString('fr-FR')}</div>
                        <p>${escapeHtml(a.contenu)}</p>
                    </div>
                    ${mediaHTML}
                `;
                announcementsContainer.appendChild(card);
            });

            const newReveals = announcementsContainer.querySelectorAll('[data-reveal]');
            newReveals.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight - 80) el.classList.add('active');
            });
        } catch (err) {
            console.error('Erreur chargement annonces:', err);
            if (announcementsContainer) {
                announcementsContainer.innerHTML = '<div class="empty-state"><p>Le service d\'annonces est momentanément indisponible.</p></div>';
            }
        }
    };
    loadAnnouncements();

    // ===== Mobile Menu =====
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = navLinks.style.display === 'flex';
            navLinks.style.display = isOpen ? 'none' : 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.background = 'rgba(0, 0, 0, 0.98)';
            navLinks.style.padding = '1.5rem 2rem';
            navLinks.style.borderTop = '1px solid rgba(120, 240, 168, 0.15)';
            navLinks.style.gap = '0.75rem';
            navLinks.style.backdropFilter = 'blur(20px)';
            if (isOpen) navLinks.removeAttribute('style');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 1024) {
                    navLinks.removeAttribute('style');
                }
            });
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});
