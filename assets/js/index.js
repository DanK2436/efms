document.addEventListener('DOMContentLoaded', () => {
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

    // ===== Contact Form & Professional Submission =====
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        // Create modal container dynamically
        const modal = document.createElement('div');
        modal.className = 'submission-modal';
        document.body.appendChild(modal);

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // 1. Récupération des champs
            const nom = document.getElementById('nom').value;
            const email = document.getElementById('email').value;
            const telephone = document.getElementById('telephone').value;
            const vehicule = document.getElementById('vehicule').value;
            const service = document.getElementById('service').value;
            const message = document.getElementById('message').value;

            // 2. Définition de l'animation en fonction du service
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

            // 3. Affichage du Modal de traitement (Effet 3D / Pro)
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <img src="../assets/images/logo_efms.jpeg" alt="EFMS" class="modal-logo">
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

            // 4. Préparation du corps de l'e-mail (Format très formel et aéré)
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
            // Assure-toi que les sauts de ligne du textarea sont conservés
            bodyText += `${message}\n\n\n`;
            
            bodyText += `---------------------------------------------------------\n`;
            bodyText += `Ce document a été formaté automatiquement par le système EFMS.`;

            const mailTo = "electronicfullmultiservice@gmail.com";
            let subject = `[EFMS] Dossier #DEV-${Math.floor(Math.random()*10000)} | ${nom} | ${service ? service.toUpperCase() : ''}`;

            // 5. Simulation de traitement et ouverture de la messagerie
            setTimeout(() => {
                document.querySelector('.processing-text').innerHTML = 'Redirection vers votre messagerie sécurisée...<br><span style="font-size:0.8rem; color:var(--text-muted); font-weight:normal; margin-top:10px; display:block;">Cliquez sur "Envoyer" dans votre application mail pour finaliser.</span>';
                document.querySelector('.progress-fill').style.background = 'var(--primary)';
                
                setTimeout(() => {
                    // C'est très important de tout encoder avec encodeURIComponent
                    const link = `mailto:${mailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
                    window.location.href = link;
                    
                    // Fin du process
                    setTimeout(() => {
                        modal.classList.remove('active');
                        contactForm.reset();
                    }, 3500);
                }, 1500);
            }, 2500);
        });
    }

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
            navLinks.style.background = 'rgba(11, 13, 14, 0.98)';
            navLinks.style.padding = '1.5rem 2rem';
            navLinks.style.borderTop = '1px solid rgba(124, 207, 43, 0.15)';
            navLinks.style.gap = '0.75rem';
            navLinks.style.backdropFilter = 'blur(20px)';
            if (isOpen) navLinks.removeAttribute('style');
        });
    }

    // ===== Smooth scroll on anchor links =====
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
