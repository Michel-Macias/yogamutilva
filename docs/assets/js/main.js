document.addEventListener('DOMContentLoaded', () => {
    // --- ACCESSIBILITY: Reduced Motion Check ---
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. REVELACIÓN POR SCROLL (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Liberar recursos tras revelar
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => revealObserver.observe(el));

    // 2. CURSOR ZEN (Solo Desktop > 1024px y sin reduced-motion)
    if (window.innerWidth > 1024 && !prefersReducedMotion) {
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

    // 3. EFECTOS HEADER Y HERO PARALLAX (con requestAnimationFrame)
    const heroContent = document.querySelector('.hero-content');
    const header = document.querySelector('header');
    let scrollTicking = false;

    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                if (scrolled > 50) {
                    header.classList.add('header-scrolled');
                } else {
                    header.classList.remove('header-scrolled');
                }

                if (heroContent && window.innerWidth > 768 && !prefersReducedMotion) {
                    heroContent.style.transform = `translateY(${scrolled * 0.4}px)`;
                    heroContent.style.opacity = 1 - (scrolled / 700);
                }
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    });

    // 4. ANIMACIÓN DE BOTONES
    if (!prefersReducedMotion) {
        const ctaButtons = document.querySelectorAll('.cta-button');
        ctaButtons.forEach(btn => {
            btn.classList.add('breathe-animation');
        });
    }

    // 5. MENÚ HAMBURGUESA MÓVIL (con ARIA y Escape key)
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    const navItems = document.querySelectorAll('.nav-links li a');

    function toggleMobileMenu() {
        const isActive = hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', String(isActive));
    }

    function closeMobileMenu() {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    }

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', toggleMobileMenu);
        hamburger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMobileMenu();
            }
        });

        navItems.forEach(item => {
            item.addEventListener('click', closeMobileMenu);
        });
    }

    // 6. SISTEMA DE MODALES UNIFICADO (DRY)
    function openModal(modalEl, triggerEl) {
        if (!modalEl) return;
        modalEl.classList.add('active');
        modalEl.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // Focus trap: mover foco al primer elemento focusable
        const focusable = modalEl.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable.length) {
            setTimeout(() => focusable[0].focus(), 100);
        }

        // Guardar referencia al trigger para devolver foco
        modalEl._triggerElement = triggerEl || document.activeElement;
    }

    function closeModal(modalEl) {
        if (!modalEl) return;
        modalEl.classList.remove('active');
        modalEl.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        // Devolver foco al trigger
        if (modalEl._triggerElement) {
            modalEl._triggerElement.focus();
        }
    }

    // Focus trap handler
    function trapFocus(e, modalEl) {
        const focusable = modalEl.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        const firstFocusable = focusable[0];
        const lastFocusable = focusable[focusable.length - 1];

        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }
    }

    // --- MODAL CALENDARIO (DUAL-VIEW) ---
    const reservationTriggers = document.querySelectorAll('.btn-reservar-trigger');
    const calModal = document.getElementById('calendario-modal');
    const calCloseBtn = document.getElementById('modal-close');
    const btnEntrarCalendario = document.getElementById('btn-entrar-calendario');
    const btnVolverSelector = document.getElementById('btn-volver-selector');
    const selectorView = document.getElementById('reservas-selector-view');
    const calendarView = document.getElementById('reservas-calendar-view');
    const modalContent = document.getElementById('reservas-modal-content');

    function resetReservasModal() {
        if (selectorView && calendarView && modalContent) {
            calendarView.style.display = 'none';
            selectorView.style.display = 'block';
            modalContent.style.maxWidth = '700px';
            modalContent.style.height = 'auto';
        }
    }

    reservationTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(calModal, trigger);
        });
    });

    if (calCloseBtn) calCloseBtn.addEventListener('click', () => {
        closeModal(calModal);
        resetReservasModal();
    });

    if (calModal) {
        calModal.addEventListener('click', (e) => {
            if (e.target === calModal) {
                closeModal(calModal);
                resetReservasModal();
            }
        });
        calModal.addEventListener('keydown', (e) => trapFocus(e, calModal));
    }

    if (btnEntrarCalendario && selectorView && calendarView && modalContent) {
        btnEntrarCalendario.addEventListener('click', () => {
            selectorView.style.display = 'none';
            calendarView.style.display = 'block';
            modalContent.style.maxWidth = '850px';
            modalContent.style.height = '85vh';
        });
    }

    if (btnVolverSelector) {
        btnVolverSelector.addEventListener('click', resetReservasModal);
    }

    // --- MODAL VÍDEO ---
    const videoTrigger = document.querySelector('.btn-video-trigger');
    const videoModal = document.getElementById('video-modal');
    const videoCloseBtn = document.getElementById('video-modal-close');
    const presentationVideo = document.getElementById('presentation-video');

    function openVideoModal(triggerEl) {
        if (videoModal && presentationVideo) {
            openModal(videoModal, triggerEl);
            presentationVideo.currentTime = 0;
            presentationVideo.play().catch(err => console.log('Autoplay blocked:', err));
            stopCarousel();
        }
    }

    function closeVideoModal() {
        if (videoModal && presentationVideo) {
            closeModal(videoModal);
            presentationVideo.pause();
            startCarousel();
        }
    }

    if (videoTrigger) {
        videoTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            openVideoModal(videoTrigger);
        });
    }

    if (videoCloseBtn) videoCloseBtn.addEventListener('click', closeVideoModal);

    if (videoModal) {
        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) closeVideoModal();
        });
        videoModal.addEventListener('keydown', (e) => trapFocus(e, videoModal));
    }

    // --- ESCAPE KEY handler global para modales y menú ---
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Cerrar modal calendario
            if (calModal && calModal.classList.contains('active')) {
                closeModal(calModal);
                resetReservasModal();
                return;
            }
            // Cerrar modal vídeo
            if (videoModal && videoModal.classList.contains('active')) {
                closeVideoModal();
                return;
            }
            // Cerrar menú hamburguesa
            if (hamburger && hamburger.classList.contains('active')) {
                closeMobileMenu();
                hamburger.focus();
                return;
            }
            // Cerrar banner cookies
            if (cookiesBanner && cookiesBanner.classList.contains('active')) {
                cookiesBanner.classList.remove('active');
                cookiesBanner.setAttribute('aria-hidden', 'true');
                return;
            }
        }
    });

    // 7. REPRODUCTOR ZEN DE MÚSICA DE FONDO (AUTOPLAY AL INTERACTUAR)
    const audioBtn = document.getElementById('audio-toggle-btn');
    const zenAudio = document.getElementById('zen-background-audio');
    const musicOnIcon = document.getElementById('music-on-icon');
    const musicOffIcon = document.getElementById('music-off-icon');

    if (audioBtn && zenAudio) {
        zenAudio.volume = 0.15;

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

        let hasAutoPlayed = false;

        function tryAutoPlay() {
            if (hasAutoPlayed) return;
            zenAudio.play()
                .then(() => {
                    hasAutoPlayed = true;
                    setAudioPlayingState(true);
                    removeAutoPlayListeners();
                })
                .catch(() => {
                    // El navegador bloquea hasta interacción directa
                });
        }

        function removeAutoPlayListeners() {
            document.removeEventListener('click', tryAutoPlay);
            document.removeEventListener('scroll', tryAutoPlay);
            document.removeEventListener('touchstart', tryAutoPlay);
        }

        document.addEventListener('click', tryAutoPlay);
        document.addEventListener('scroll', tryAutoPlay);
        document.addEventListener('touchstart', tryAutoPlay);

        audioBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            hasAutoPlayed = true;
            removeAutoPlayListeners();

            if (zenAudio.paused) {
                zenAudio.play()
                    .then(() => setAudioPlayingState(true))
                    .catch(() => {});
            } else {
                zenAudio.pause();
                setAudioPlayingState(false);
            }
        });
    }

    // 8. CARRUSEL DE FONDO DEL HERO (con visibilitychange)
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    let currentSlide = 0;
    let carouselInterval;
    const slideDuration = 6000;

    function showSlide(index) {
        if (!slides.length) return;
        slides[currentSlide].classList.remove('active');
        if (dots[currentSlide]) {
            dots[currentSlide].classList.remove('active');
            dots[currentSlide].removeAttribute('aria-current');
        }
        currentSlide = index;
        slides[currentSlide].classList.add('active');
        if (dots[currentSlide]) {
            dots[currentSlide].classList.add('active');
            dots[currentSlide].setAttribute('aria-current', 'true');
        }
    }

    function nextSlide() {
        showSlide((currentSlide + 1) % slides.length);
    }

    function startCarousel() {
        if (slides.length > 1 && !prefersReducedMotion) {
            carouselInterval = setInterval(nextSlide, slideDuration);
        }
    }

    function stopCarousel() {
        if (carouselInterval) {
            clearInterval(carouselInterval);
            carouselInterval = null;
        }
    }

    startCarousel();

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopCarousel();
            showSlide(index);
            startCarousel();
        });
    });

    // Pausar carrusel cuando la pestaña no está visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopCarousel();
        } else {
            startCarousel();
        }
    });

    // 9. BANNER DE COOKIES INFORMATIVO
    const cookiesBanner = document.getElementById('cookies-banner');
    const cookiesAcceptBtn = document.getElementById('btn-cookies-accept');
    const cookiesConfigLink = document.getElementById('open-cookies-config');

    if (cookiesBanner && cookiesAcceptBtn) {
        let consent;
        try {
            consent = localStorage.getItem('yogamutilva-cookies-consent');
        } catch (e) {
            consent = null;
        }

        if (!consent) {
            setTimeout(() => {
                cookiesBanner.classList.add('active');
                cookiesBanner.setAttribute('aria-hidden', 'false');
            }, 1500);
        }

        cookiesAcceptBtn.addEventListener('click', () => {
            try {
                localStorage.setItem('yogamutilva-cookies-consent', 'accepted');
            } catch (e) {
                // localStorage no disponible
            }
            cookiesBanner.classList.remove('active');
            cookiesBanner.setAttribute('aria-hidden', 'true');
        });

        if (cookiesConfigLink) {
            cookiesConfigLink.addEventListener('click', (e) => {
                e.preventDefault();
                cookiesBanner.classList.add('active');
                cookiesBanner.setAttribute('aria-hidden', 'false');
            });
        }
    }
});
