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

    // 2. CURSOR ZEN (Desktop)
    const cursor = document.getElementById('custom-cursor');
    const cursorDot = document.getElementById('custom-cursor-dot');
    
    if (cursor && cursorDot) {
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

    // 6. LÓGICA DEL MODAL CALENDARIO
    const btnHero = document.getElementById('btn-reservar-hero');
    const btnFooter = document.getElementById('btn-reservar-footer');
    const modal = document.getElementById('calendario-modal');
    const closeBtn = document.getElementById('modal-close');

    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Evitar scroll fondo
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (btnHero) btnHero.addEventListener('click', openModal);
    if (btnFooter) btnFooter.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    
    // Cerrar si se hace click fuera del modal
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }
});
