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

    // 2. CURSOR ZEN (Magnetic & Soft)
    const cursor = document.createElement('div');
    cursor.id = 'custom-cursor';
    document.body.appendChild(cursor);

    const cursorDot = document.createElement('div');
    cursorDot.id = 'custom-cursor-dot';
    document.body.appendChild(cursorDot);

    document.addEventListener('mousemove', (e) => {
        const { clientX: x, clientY: y } = e;
        
        // El punto sigue exacto
        cursorDot.style.transform = `translate(${x}px, ${y}px)`;
        
        // El aura sigue con un ligero retraso (suavidad)
        cursor.animate({
            transform: `translate(${x}px, ${y}px)`
        }, { duration: 500, fill: 'forwards' });
    });

    // Efecto magnético en enlaces y botones
    const interactiveElements = document.querySelectorAll('a, button, .team-card, .card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-hover');
            cursorDot.classList.add('dot-hover');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-hover');
            cursorDot.classList.remove('dot-hover');
        });
    });

    // 3. PARALLAX ORGÁNICO (Hero)
    const heroContent = document.querySelector('.hero-content');
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        if (heroContent) {
            heroContent.style.transform = `translateY(${scrolled * 0.4}px)`;
            heroContent.style.opacity = 1 - (scrolled / 700);
        }
    });

    // 4. EFECTO RESPIRACIÓN EN BOTONES
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(btn => {
        btn.classList.add('breathe-animation');
    });
});
