// ========== HERO SECTION INTERACTIVITY ==========
document.addEventListener('DOMContentLoaded', () => {
    const hero = document.getElementById('hero');
    const floatingElements = document.querySelectorAll('.floating-element[data-parallax]');

    // ========== MOUSE PARALLAX ==========
    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;
    let isAnimating = false;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;

        if (!isAnimating) {
            isAnimating = true;
            requestAnimationFrame(updateParallax);
        }
    });

    function updateParallax() {
        currentX += (mouseX - currentX) * 0.06;
        currentY += (mouseY - currentY) * 0.06;

        floatingElements.forEach(el => {
            // Skip elements currently being dragged
            if (el.dataset.dragging === 'true') return;
            const speed = parseFloat(el.dataset.parallax) || 0.5;
            const moveX = currentX * speed * 25;
            const moveY = currentY * speed * 25;
            el.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });

        if (Math.abs(mouseX - currentX) > 0.001 || Math.abs(mouseY - currentY) > 0.001) {
            requestAnimationFrame(updateParallax);
        } else {
            isAnimating = false;
        }
    }

    // ========== INTERACTIVE TOOL PALETTE ==========
    const toolItems = document.querySelectorAll('.tool-item');
    toolItems.forEach(item => {
        item.addEventListener('click', () => {
            toolItems.forEach(t => t.classList.remove('active-tool'));
            item.classList.add('active-tool');

            // Ripple effect
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                width: 30px; height: 30px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                top: 50%; left: 50%;
                margin-top: -15px; margin-left: -15px;
                transform: scale(0);
                animation: rippleEffect 0.4s ease-out forwards;
                pointer-events: none;
            `;
            item.appendChild(ripple);
            setTimeout(() => ripple.remove(), 400);
        });

        item.addEventListener('mouseenter', () => {
            item.style.background = 'rgba(255,255,255,0.12)';
        });
        item.addEventListener('mouseleave', () => {
            if (!item.classList.contains('active-tool')) {
                item.style.background = '';
            }
        });
    });

    // ========== STICKER CLICK ANIMATION ==========
    const character = document.getElementById('draggable-sticker');
    if (character) {
        const sticker = character.querySelector('.character-sticker');
        const floatInner = character.querySelector('.float-inner');
        const tagline = document.getElementById('tagline-reveal');
        let hasRevealed = false;

        character.style.cursor = 'pointer';

        // Use document-level click with hit testing to bypass stacking context
        function isClickOnSticker(e) {
            const rect = character.getBoundingClientRect();
            return e.clientX >= rect.left && e.clientX <= rect.right &&
                e.clientY >= rect.top && e.clientY <= rect.bottom;
        }

        document.addEventListener('click', function (e) {
            if (!isClickOnSticker(e)) return;
            e.preventDefault();
            e.stopPropagation();

            // Bounce animation on sticker
            sticker.style.transition = 'transform 0.15s ease';
            sticker.style.transform = 'scale(1.25) rotate(-8deg)';
            sticker.style.filter = 'drop-shadow(0 20px 40px rgba(0,0,0,0.25))';

            setTimeout(() => {
                sticker.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.4s ease';
                sticker.style.transform = 'scale(1) rotate(0deg)';
                sticker.style.filter = '';
            }, 150);

            // Burst emoji particles
            const emojis = ['✨', '⚡', '🔥', '💫', '🍥', '🌀'];
            emojis.forEach((emoji, i) => {
                createParticle(character, emoji, i, emojis.length);
            });

            // Reveal tagline on first click
            if (!hasRevealed && tagline) {
                hasRevealed = true;
                setTimeout(() => {
                    tagline.style.opacity = '1';
                    tagline.style.transform = 'translateY(0)';
                }, 300);
            }
        }, true);
    }

    function createParticle(parent, emoji, index, total) {
        const particle = document.createElement('div');
        particle.textContent = emoji;
        const rect = parent.getBoundingClientRect();
        particle.style.cssText = `
            position: fixed;
            font-size: ${14 + Math.random() * 8}px;
            pointer-events: none;
            z-index: 100;
            top: ${rect.top + rect.height / 2}px;
            left: ${rect.left + rect.width / 2}px;
            opacity: 1;
            transition: all 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        `;
        document.body.appendChild(particle);

        requestAnimationFrame(() => {
            const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
            const distance = 70 + Math.random() * 50;
            particle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance - 40}px) scale(0.5)`;
            particle.style.opacity = '0';
        });

        setTimeout(() => particle.remove(), 900);
    }

    // ========== TYPEWRITER EFFECT ==========
    const beautyText = document.getElementById('beautyText');
    const words = ['execution.', 'clarity.', 'momentum.', 'impact.', 'growth.'];
    let wordIndex = 0;
    let charIndex = words[0].length;
    let isDeleting = false;

    function typeWriter() {
        const currentWord = words[wordIndex];

        if (isDeleting) {
            charIndex--;
            beautyText.textContent = currentWord.substring(0, charIndex);
        } else {
            charIndex++;
            beautyText.textContent = currentWord.substring(0, charIndex);
        }

        let delay = isDeleting ? 50 : 90;

        if (!isDeleting && charIndex === currentWord.length) {
            delay = 3000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            delay = 400;
        }

        setTimeout(typeWriter, delay);
    }

    // Start after entrance animation
    setTimeout(typeWriter, 3500);

    // ========== KEYBOARD KEY PRESS EFFECT ==========
    const keys = document.querySelectorAll('.key-icon');
    keys.forEach(key => {
        key.style.transition = 'transform 0.15s ease, filter 0.15s ease';

        key.addEventListener('mousedown', () => {
            key.style.transform = 'scale(0.9) translateY(2px)';
            key.style.filter = 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))';
        });

        const reset = () => {
            key.style.transform = '';
            key.style.filter = '';
        };

        key.addEventListener('mouseup', reset);
        key.addEventListener('mouseleave', reset);
    });

    // ========== ROUTE PILL INTERACTIONS ==========
    const routePills = document.querySelectorAll('.route-pill');
    routePills.forEach(pill => {
        // Active state toggle
        pill.addEventListener('click', (e) => {
            e.preventDefault();
            routePills.forEach(p => p.classList.remove('active-route'));
            pill.classList.add('active-route');
        });

        // Magnetic hover
        pill.addEventListener('mousemove', (e) => {
            const rect = pill.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            pill.style.transform = `translateY(-3px) scale(1.04) translate(${x * 0.08}px, ${y * 0.08}px)`;
        });

        pill.addEventListener('mouseleave', () => {
            pill.style.transform = '';
        });
    });

    // ========== PILL BADGE CLICK ==========
    const pillBadge = document.querySelector('.pill-badge');
    if (pillBadge) {
        pillBadge.addEventListener('click', () => {
            pillBadge.style.background = '#1a1a1a';
            pillBadge.style.color = 'white';
            pillBadge.style.borderColor = '#1a1a1a';
            pillBadge.style.transform = 'scale(1.05)';

            setTimeout(() => {
                pillBadge.style.background = '';
                pillBadge.style.color = '';
                pillBadge.style.borderColor = '';
                pillBadge.style.transform = '';
            }, 400);
        });
    }

    // ========== NAVBAR SCROLL SHADOW ==========
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.06)';
        } else {
            navbar.style.boxShadow = '';
        }
    });

    // ========== MAGNETIC HOVER ON NAV BUTTONS ==========
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });

    // ========== DYNAMIC KEYFRAME ==========
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rippleEffect {
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(2.5); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});
