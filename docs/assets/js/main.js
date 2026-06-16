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

    // 2. CURSOR ZEN DECORATIVO (Solo Desktop > 1024px y sin reduced-motion, no oculta el cursor del sistema)
    if (window.innerWidth > 1024 && !prefersReducedMotion) {
        const cursor = document.createElement('div');
        cursor.id = 'custom-cursor';
        document.body.appendChild(cursor);

        let ax = 0, ay = 0, cx = 0, cy = 0, raf;

        document.addEventListener('mousemove', (e) => {
            ax = e.clientX;
            ay = e.clientY;
            cursor.style.opacity = '0.75';
            if (!raf) {
                loop();
            }
        });

        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
        });

        function loop() {
            // Suavizado por interpolación lineal (lerp)
            cx += (ax - cx) * 0.18;
            cy += (ay - cy) * 0.18;
            cursor.style.transform = `translate(${cx}px, ${cy}px)`;
            
            raf = (Math.abs(ax - cx) > 0.4 || Math.abs(ay - cy) > 0.4)
                ? requestAnimationFrame(loop)
                : null;
        }

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
        document.body.style.overflow = isActive ? 'hidden' : '';
    }

    function closeMobileMenu() {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
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
        const selectEl = document.getElementById('modal-docente-select');
        if (selectEl) {
            selectEl.value = '';
            selectEl.dispatchEvent(new Event('change'));
        }
    }

    reservationTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(calModal, trigger);
            
            // Lógica de preselección contextual del docente
            const targetDocente = trigger.getAttribute('data-docente');
            const selectEl = document.getElementById('modal-docente-select');
            if (selectEl) {
                if (targetDocente) {
                    selectEl.value = targetDocente;
                } else {
                    selectEl.value = ''; // Por defecto selecciona el placeholder
                }
                selectEl.dispatchEvent(new Event('change'));
            }
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

    // --- LÓGICA DE WHATSAPP DINÁMICO EN EL MODAL ---
    const docenteSelect = document.getElementById('modal-docente-select');
    const waDocenteBtn = document.getElementById('btn-whatsapp-docente');
    const waDocenteText = document.getElementById('text-whatsapp-docente');

    if (docenteSelect && waDocenteBtn && waDocenteText) {
        docenteSelect.addEventListener('change', () => {
            const selectedOption = docenteSelect.options[docenteSelect.selectedIndex];
            
            if (selectedOption && selectedOption.value) {
                const phone = selectedOption.getAttribute('data-phone');
                const name = selectedOption.getAttribute('data-name');
                const className = selectedOption.getAttribute('data-class');
                
                // Mensaje personalizado
                const text = encodeURIComponent(`¡Hola ${name}! Me gustaría obtener información sobre tu clase o sesión de ${className} y sobre cómo reservar.`);
                
                // Habilitar botón de WhatsApp
                waDocenteBtn.href = `https://wa.me/${phone}?text=${text}`;
                waDocenteBtn.classList.remove('disabled-button');
                waDocenteBtn.style.cursor = 'pointer';
                waDocenteBtn.style.pointerEvents = 'auto';
                waDocenteBtn.style.opacity = '1';
                waDocenteBtn.style.background = 'var(--contrast)';
                
                waDocenteText.textContent = `Contactar con ${name}`;
            } else {
                // Deshabilitar botón de WhatsApp
                waDocenteBtn.href = 'javascript:void(0)';
                waDocenteBtn.classList.add('disabled-button');
                waDocenteBtn.style.cursor = 'not-allowed';
                waDocenteBtn.style.pointerEvents = 'none';
                waDocenteBtn.style.opacity = '0.5';
                waDocenteBtn.style.background = '#888';
                
                waDocenteText.textContent = 'Selecciona una opción';
            }
        });
    }

    // --- MODAL VÍDEO PRINCIPAL ---
    const mainVideoTrigger = document.querySelector('.btn-video-trigger');
    const mainVideoModal = document.getElementById('video-modal');
    const mainVideoCloseBtn = document.getElementById('video-modal-close');
    const presentationVideo = document.getElementById('presentation-video');

    function openMainVideoModal(triggerEl) {
        if (mainVideoModal && presentationVideo) {
            openModal(mainVideoModal, triggerEl);
            presentationVideo.currentTime = 0;
            presentationVideo.play().catch(err => console.log('Autoplay blocked:', err));
            stopCarousel();
        }
    }

    function closeMainVideoModal() {
        if (mainVideoModal && presentationVideo) {
            closeModal(mainVideoModal);
            presentationVideo.pause();
            startCarousel();
        }
    }

    if (mainVideoTrigger) {
        mainVideoTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            openMainVideoModal(mainVideoTrigger);
        });
    }

    if (mainVideoCloseBtn) mainVideoCloseBtn.addEventListener('click', closeMainVideoModal);

    if (mainVideoModal) {
        mainVideoModal.addEventListener('click', (e) => {
            if (e.target === mainVideoModal) closeMainVideoModal();
        });
        mainVideoModal.addEventListener('keydown', (e) => trapFocus(e, mainVideoModal));
    }

    // --- MODAL VÍDEO RETIROS ---
    const retirosVideoTrigger = document.getElementById('video-retiros-trigger');
    const retirosVideoModal = document.getElementById('retiros-video-modal');
    const retirosVideoCloseBtn = document.getElementById('close-video-modal');
    const retirosVideo = document.getElementById('retiros-video-element');

    function openRetirosVideoModal(triggerEl) {
        if (retirosVideoModal && retirosVideo) {
            openModal(retirosVideoModal, triggerEl);
            retirosVideoModal.style.display = 'flex';
            retirosVideo.currentTime = 0;
            retirosVideo.play().catch(err => console.log('Autoplay blocked:', err));
            stopCarousel();
        }
    }

    function closeRetirosVideoModal() {
        if (retirosVideoModal && retirosVideo) {
            closeModal(retirosVideoModal);
            retirosVideoModal.style.display = 'none';
            retirosVideo.pause();
            startCarousel();
        }
    }

    if (retirosVideoTrigger) {
        retirosVideoTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            openRetirosVideoModal(retirosVideoTrigger);
        });
    }

    if (retirosVideoCloseBtn) retirosVideoCloseBtn.addEventListener('click', closeRetirosVideoModal);

    if (retirosVideoModal) {
        retirosVideoModal.addEventListener('click', (e) => {
            if (e.target === retirosVideoModal) closeRetirosVideoModal();
        });
        retirosVideoModal.addEventListener('keydown', (e) => trapFocus(e, retirosVideoModal));
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
            // Cerrar modal vídeo principal
            if (mainVideoModal && mainVideoModal.classList.contains('active')) {
                closeMainVideoModal();
                return;
            }
            // Cerrar modal vídeo retiros
            if (retirosVideoModal && retirosVideoModal.classList.contains('active')) {
                closeRetirosVideoModal();
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

    // 7. REPRODUCTOR ZEN DE MÚSICA DE FONDO (ACTIVADO EXCLUSIVAMENTE POR EL USUARIO)
    const audioBtn = document.getElementById('audio-toggle-btn');
    const zenAudio = document.getElementById('zen-background-audio');
    const musicOnIcon = document.getElementById('music-on-icon');
    const musicOffIcon = document.getElementById('music-off-icon');
    const audioTooltip = document.querySelector('.zen-audio-tooltip');

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

        // Mostrar tooltip transcurridos 1.5s de la carga y ocultarlo a los 8s
        if (audioTooltip) {
            setTimeout(() => {
                if (zenAudio.paused) {
                    audioTooltip.classList.add('visible');
                }
            }, 1500);
            setTimeout(() => {
                audioTooltip.classList.remove('visible');
            }, 8000);
        }

        audioBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (audioTooltip) {
                audioTooltip.classList.remove('visible');
            }

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
        
        // Cargar imagen de fondo bajo demanda (lazy loading de diapositivas)
        const nextSlide = slides[index];
        if (nextSlide && nextSlide.dataset.bg) {
            nextSlide.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('${nextSlide.dataset.bg}')`;
            nextSlide.removeAttribute('data-bg');
        }
        
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

    // --- 10. SISTEMA DE PESTAÑAS INTERACTIVAS (#actividades) ---
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    function activateTab(tabId) {
        const tabButton = document.getElementById(tabId);
        if (!tabButton) return;
        const targetId = tabButton.getAttribute('aria-controls');
        
        tabButtons.forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
        });
        
        tabPanels.forEach(p => {
            p.classList.remove('active');
        });
        
        tabButton.classList.add('active');
        tabButton.setAttribute('aria-selected', 'true');
        
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
        
        // Centrar botón activo en móviles (desplazamiento horizontal)
        const navWrapper = document.querySelector('.tabs-nav-wrapper');
        if (navWrapper) {
            const wrapperLeft = navWrapper.getBoundingClientRect().left;
            const buttonLeft = tabButton.getBoundingClientRect().left;
            const scrollOffset = buttonLeft - wrapperLeft - (navWrapper.clientWidth / 2) + (tabButton.clientWidth / 2);
            navWrapper.scrollBy({ left: scrollOffset, behavior: 'smooth' });
        }
    }

    if (tabButtons.length > 0) {
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                activateTab(btn.id);
            });
        });

        // Interceptar transiciones de hash o clicks a pestañas de actividades
        function checkHashForTab() {
            const hash = window.location.hash;
            if (!hash) return;
            
            const cleanHash = hash.substring(1);
            let targetTabId = null;
            
            if (cleanHash.startsWith('panel-')) {
                targetTabId = cleanHash.replace('panel-', 'tab-');
            } else if (cleanHash.startsWith('tab-')) {
                targetTabId = cleanHash;
            } else {
                const potentialTab = document.getElementById(`tab-${cleanHash}`);
                if (potentialTab) {
                    targetTabId = `tab-${cleanHash}`;
                }
            }
            
            if (targetTabId && document.getElementById(targetTabId)) {
                activateTab(targetTabId);
                const section = document.getElementById('actividades');
                if (section) {
                    setTimeout(() => {
                        section.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                }
            }
        }

        // Ejecutar al cargar la página si hay hash
        window.addEventListener('load', checkHashForTab);
        window.addEventListener('hashchange', checkHashForTab);

        // Interceptar clicks en enlaces locales a actividades/paneles
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (!href || href === '#' || href.startsWith('#tab-') || href === '#actividades') return;
                
                const targetId = href.substring(1);
                if (targetId.startsWith('panel-') || document.getElementById(`tab-${targetId}`)) {
                    e.preventDefault();
                    const tabId = targetId.startsWith('panel-') ? targetId.replace('panel-', 'tab-') : `tab-${targetId}`;
                    activateTab(tabId);
                    
                    const section = document.getElementById('actividades');
                    if (section) {
                        section.scrollIntoView({ behavior: 'smooth' });
                    }
                    history.pushState(null, null, href);
                }
            });
        });

        // --- SWIPE GESTURES PARA PESTAÑAS EN MÓVIL ---
        const tabsContentContainer = document.querySelector('.tabs-content');
        if (tabsContentContainer) {
            let touchStartX = 0;
            let touchEndX = 0;
            let touchStartY = 0;
            let touchEndY = 0;

            tabsContentContainer.addEventListener('touchstart', e => {
                touchStartX = e.changedTouches[0].screenX;
                touchStartY = e.changedTouches[0].screenY;
            }, { passive: true });

            tabsContentContainer.addEventListener('touchend', e => {
                touchEndX = e.changedTouches[0].screenX;
                touchEndY = e.changedTouches[0].screenY;
                handleSwipe();
            }, { passive: true });

            function handleSwipe() {
                // Solo activamos gestos en versión móvil/tablet (< 1024px)
                if (window.innerWidth > 1024) return;
                
                const swipeThreshold = 120;
                const diffX = touchEndX - touchStartX;
                const diffY = touchEndY - touchStartY;

                // Si el movimiento vertical es mayor que el horizontal, ignoramos (es scroll para leer)
                if (Math.abs(diffY) > Math.abs(diffX)) return;
                if (Math.abs(diffX) < swipeThreshold) return; // Ignore small swipes

                // Encontrar el índice de la pestaña activa actual
                let currentIndex = -1;
                tabButtons.forEach((btn, index) => {
                    if (btn.classList.contains('active')) {
                        currentIndex = index;
                    }
                });

                if (currentIndex === -1) return;

                if (diffX < 0) {
                    // Swipe a la izquierda -> Siguiente pestaña
                    if (currentIndex < tabButtons.length - 1) {
                        activateTab(tabButtons[currentIndex + 1].id);
                    }
                } else {
                    // Swipe a la derecha -> Pestaña anterior
                    if (currentIndex > 0) {
                        activateTab(tabButtons[currentIndex - 1].id);
                    }
                }
            }
        }
    }

    // --- 11. SCROLLSPY (Resaltado de Navegación) ---
    const spySections = document.querySelectorAll('#conocenos, #actividades, #horarios, #tarifas, #alquiler, #contacto');
    const spyNavItems = document.querySelectorAll('.nav-links li a');

    if (spySections.length > 0 && spyNavItems.length > 0) {
        const spyObserverOptions = {
            root: null,
            rootMargin: '-30% 0px -60% 0px', // Activar cuando esté en el tercio central
            threshold: 0
        };

        const spyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    spyNavItems.forEach(item => {
                        const href = item.getAttribute('href');
                        if (href === `#${id}`) {
                            item.classList.add('active');
                        } else if (href !== 'javascript:void(0)' && href !== '#') {
                            item.classList.remove('active');
                        }
                    });
                }
            });
        }, spyObserverOptions);

        spySections.forEach(section => spyObserver.observe(section));

        // Quitar active cuando estemos en el hero o arriba del todo
        window.addEventListener('scroll', () => {
            if (window.scrollY < 100) {
                spyNavItems.forEach(item => item.classList.remove('active'));
            }
        });
    }
});
