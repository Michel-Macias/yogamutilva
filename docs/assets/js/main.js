document.addEventListener('DOMContentLoaded', () => {
    // 1. REVELACIÓN POR SCROLL (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => revealObserver.observe(el));

    // 2. CURSOR ZEN (Solo Desktop > 1024px)
    if (window.innerWidth > 1024) {
        const cursor = document.createElement('div');
        cursor.id = 'custom-cursor';
        document.body.appendChild(cursor);

        const cursorDot = document.createElement('div');
        cursorDot.id = 'custom-cursor-dot';
        document.body.appendChild(cursorDot);

        document.addEventListener('mousemove', (e) => {
            const { clientX: x, clientY: y } = e;
            cursorDot.style.transform = `translate(${x}px, ${y}px)`;
            cursor.animate({
                transform: `translate(${x}px, ${y}px)`
            }, { duration: 500, fill: 'forwards' });
        });

        const interactiveElements = document.querySelectorAll('a, button, .team-card, .card');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
        });
    }

    // 3. EFECTOS HEADER Y HERO PARALLAX
    const heroContent = document.querySelector('.hero-content');
    const header = document.querySelector('header');

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        if (scrolled > 50) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }

        if (heroContent && window.innerWidth > 768) {
            // Parallax sólo en desktop para mejor rendimiento en móvil
            heroContent.style.transform = `translateY(${scrolled * 0.4}px)`;
            heroContent.style.opacity = 1 - (scrolled / 700);
        }
    });

    // 4. ANIMACIÓN DE BOTONES
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(btn => {
        btn.classList.add('breathe-animation');
    });

    // 5. MENÚ HAMBURGUESA MÓVIL
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    const navItems = document.querySelectorAll('.nav-links li a');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Cerrar menú al hacer clic en un enlace
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // 6. LÓGICA DEL MODAL CALENDARIO (COMBINADO DUAL-VIEW)
    const reservationTriggers = document.querySelectorAll('.btn-reservar-trigger');
    const modal = document.getElementById('calendario-modal');
    const closeBtn = document.getElementById('modal-close');
    
    // Elementos de la vista dual de reservas
    const btnEntrarCalendario = document.getElementById('btn-entrar-calendario');
    const btnVolverSelector = document.getElementById('btn-volver-selector');
    const selectorView = document.getElementById('reservas-selector-view');
    const calendarView = document.getElementById('reservas-calendar-view');
    const modalContent = document.getElementById('reservas-modal-content');

    function openModal() {
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Evitar scroll fondo
        }
    }

    function resetReservasModal() {
        if (selectorView && calendarView && modalContent) {
            calendarView.style.display = 'none';
            selectorView.style.display = 'block';
            modalContent.style.maxWidth = '700px';
            modalContent.style.height = 'auto';
        }
    }

    function closeModal() {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            // Resetear a la vista del selector para la próxima apertura
            resetReservasModal();
        }
    }

    reservationTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    
    // Cerrar si se hace click fuera del modal
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // Control dinámico de vistas en el modal de reservas
    if (btnEntrarCalendario && selectorView && calendarView && modalContent) {
        btnEntrarCalendario.addEventListener('click', () => {
            selectorView.style.display = 'none';
            calendarView.style.display = 'block';
            modalContent.style.maxWidth = '850px'; // Agrandar para albergar el calendario iframe
            modalContent.style.height = '85vh';
        });
    }

    if (btnVolverSelector && selectorView && calendarView && modalContent) {
        btnVolverSelector.addEventListener('click', () => {
            resetReservasModal();
        });
    }

    // 7. LÓGICA DEL VÍDEO MODAL
    const videoTrigger = document.querySelector('.btn-video-trigger');
    const videoModal = document.getElementById('video-modal');
    const videoCloseBtn = document.getElementById('video-modal-close');
    const presentationVideo = document.getElementById('presentation-video');

    function openVideoModal() {
        if (videoModal && presentationVideo) {
            videoModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            presentationVideo.currentTime = 0;
            presentationVideo.play().catch(err => console.log('Autoplay blocked:', err));
        }
    }

    function closeVideoModal() {
        if (videoModal && presentationVideo) {
            videoModal.classList.remove('active');
            document.body.style.overflow = '';
            presentationVideo.pause();
        }
    }

    if (videoTrigger) {
        videoTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            openVideoModal();
        });
    }

    if (videoCloseBtn) videoCloseBtn.addEventListener('click', closeVideoModal);

    if (videoModal) {
        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) closeVideoModal();
        });
    }

    // 8. LÓGICA DEL REPRODUCTOR ZEN DE MÚSICA DE FONDO (AUTOPLAY AL INTERACTUAR)
    const audioBtn = document.getElementById('audio-toggle-btn');
    const zenAudio = document.getElementById('zen-background-audio');
    const musicOnIcon = document.getElementById('music-on-icon');
    const musicOffIcon = document.getElementById('music-off-icon');

    if (audioBtn && zenAudio) {
        // Inicializar volumen muy suave (15%) para dar atmósfera sin molestar
        zenAudio.volume = 0.15;

        // Función para cambiar el estado visual del botón
        function setAudioPlayingState(isPlaying) {
            if (isPlaying) {
                audioBtn.classList.add('playing');
                musicOnIcon.style.display = 'block';
                musicOffIcon.style.display = 'none';
            } else {
                audioBtn.classList.remove('playing');
                musicOnIcon.style.display = 'none';
                musicOffIcon.style.display = 'block';
            }
        }

        // Controladores para la reproducción automática en interacción
        let hasAutoPlayed = false;

        function tryAutoPlay() {
            if (hasAutoPlayed) return;

            zenAudio.play()
                .then(() => {
                    hasAutoPlayed = true;
                    setAudioPlayingState(true);
                    removeAutoPlayListeners();
                })
                .catch(err => {
                    // El navegador bloquea hasta interacción de click/scroll, reintenta en el siguiente evento
                    console.log('Autoplay deferred:', err);
                });
        }

        function removeAutoPlayListeners() {
            document.removeEventListener('click', tryAutoPlay);
            document.removeEventListener('scroll', tryAutoPlay);
            document.removeEventListener('touchstart', tryAutoPlay);
        }

        // Activar reproducción en la primera acción del usuario
        document.addEventListener('click', tryAutoPlay);
        document.addEventListener('scroll', tryAutoPlay);
        document.addEventListener('touchstart', tryAutoPlay);

        // Control de alternado manual por botón
        audioBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar que el click se propague al document
            hasAutoPlayed = true; // Desactivar cualquier reintento de autoplay
            removeAutoPlayListeners();

            if (zenAudio.paused) {
                zenAudio.play()
                    .then(() => {
                        setAudioPlayingState(true);
                    })
                    .catch(err => {
                        console.log('Audio manual play blocked:', err);
                    });
            } else {
                zenAudio.pause();
                setAudioPlayingState(false);
            }
        });
    }

    // 9. LÓGICA DEL BANNER DE COOKIES INFORMATIVO
    const cookiesBanner = document.getElementById('cookies-banner');
    const cookiesAcceptBtn = document.getElementById('btn-cookies-accept');
    const cookiesConfigLink = document.getElementById('open-cookies-config');

    if (cookiesBanner && cookiesAcceptBtn) {
        // Comprobar si ya se ha aceptado anteriormente
        const consent = localStorage.getItem('alaya-cookies-consent');

        if (!consent) {
            // Esperar 1.5 segundos para mostrarlo de forma elegante
            setTimeout(() => {
                cookiesBanner.classList.add('active');
                cookiesBanner.setAttribute('aria-hidden', 'false');
            }, 1500);
        }

        // Evento al aceptar
        cookiesAcceptBtn.addEventListener('click', () => {
            localStorage.setItem('alaya-cookies-consent', 'accepted');
            cookiesBanner.classList.remove('active');
            cookiesBanner.setAttribute('aria-hidden', 'true');
        });

        // Evento al volver a abrir desde el footer (Gestión de cookies)
        if (cookiesConfigLink) {
            cookiesConfigLink.addEventListener('click', (e) => {
                e.preventDefault();
                cookiesBanner.classList.add('active');
                cookiesBanner.setAttribute('aria-hidden', 'false');
            });
        }
    }
});
