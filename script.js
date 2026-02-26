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

    // ========== DRAGGABLE STICKER WITH 3D TILT ==========
    const character = document.getElementById('draggable-sticker');
    if (character) {
        const sticker = character.querySelector('.character-sticker');
        const stickerImg = character.querySelector('img');
        const floatInner = character.querySelector('.float-inner');
        let isDragging = false;
        let dragStartX, dragStartY;
        let offsetX = 0, offsetY = 0;
        let prevX = 0, prevY = 0;
        let prevTime = 0;
        let lastVX = 0, lastVY = 0;
        let inertiaRAF = null;
        let minX = -Infinity, maxX = Infinity, minY = -Infinity, maxY = Infinity;

        // Prevent default image drag behavior
        if (stickerImg) {
            stickerImg.setAttribute('draggable', 'false');
            stickerImg.style.pointerEvents = 'none';
        }

        character.style.cursor = 'grab';
        character.style.userSelect = 'none';
        character.style.webkitUserSelect = 'none';
        character.style.touchAction = 'none';

        const saved = localStorage.getItem('stickerPos');
        if (saved) {
            try {
                const p = JSON.parse(saved);
                if (typeof p.x === 'number' && typeof p.y === 'number') {
                    offsetX = p.x;
                    offsetY = p.y;
                    character.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
                }
            } catch {}
        }

        character.addEventListener('mousedown', startDrag);
        character.addEventListener('touchstart', startDrag, { passive: false });
        character.addEventListener('dblclick', () => {
            offsetX = 0;
            offsetY = 0;
            character.style.transition = '';
            character.style.transform = '';
            localStorage.removeItem('stickerPos');
        });

        function startDrag(e) {
            e.preventDefault();
            e.stopPropagation();
            isDragging = true;

            const point = e.touches ? e.touches[0] : e;
            dragStartX = point.clientX - offsetX;
            dragStartY = point.clientY - offsetY;
            prevX = point.clientX;
            prevY = point.clientY;
            prevTime = performance.now();
            cancelInertia();
            computeBounds();

            // Lift effect
            character.style.cursor = 'grabbing';
            document.body.style.cursor = 'grabbing';
            character.style.zIndex = '50';
            floatInner.style.animation = 'none';
            sticker.style.transition = 'filter 0.15s ease, transform 0.15s ease';
            sticker.style.filter = 'drop-shadow(0 25px 50px rgba(0,0,0,0.3))';
            sticker.style.transform = 'scale(1.12)';

            document.addEventListener('mousemove', moveDrag);
            document.addEventListener('mouseup', endDrag);
            document.addEventListener('touchmove', moveDrag, { passive: false });
            document.addEventListener('touchend', endDrag);
        }

        function moveDrag(e) {
            if (!isDragging) return;
            e.preventDefault();

            const point = e.touches ? e.touches[0] : e;
            offsetX = point.clientX - dragStartX;
            offsetY = point.clientY - dragStartY;
            if (minX > -Infinity) {
                offsetX = Math.max(minX, Math.min(maxX, offsetX));
                offsetY = Math.max(minY, Math.min(maxY, offsetY));
            }

            // Velocity for 3D tilt
            const now = performance.now();
            const dt = Math.max(now - prevTime, 1);
            const vx = (point.clientX - prevX) / dt;
            const vy = (point.clientY - prevY) / dt;
            prevX = point.clientX;
            prevY = point.clientY;
            prevTime = now;
            lastVX = vx;
            lastVY = vy;

            const tiltY = Math.max(-30, Math.min(30, vx * 35));
            const tiltX = Math.max(-30, Math.min(30, -vy * 35));
            const speed = Math.min(1, Math.sqrt(vx * vx + vy * vy) * 2);
            const shadow = 12 + speed * 28;

            character.style.transition = 'none';
            character.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            sticker.style.transition = 'none';
            sticker.style.transform = `scale(1.12) perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
            sticker.style.filter = `drop-shadow(0 ${shadow}px ${shadow * 1.6}px rgba(0,0,0,0.3))`;
        }

        function endDrag() {
            if (!isDragging) return;
            isDragging = false;

            document.removeEventListener('mousemove', moveDrag);
            document.removeEventListener('mouseup', endDrag);
            document.removeEventListener('touchmove', moveDrag);
            document.removeEventListener('touchend', endDrag);

            character.style.cursor = 'grab';
            document.body.style.cursor = '';
            startInertia();
            localStorage.setItem('stickerPos', JSON.stringify({ x: offsetX, y: offsetY }));
        }

        function startInertia() {
            let vx = lastVX * 120;
            let vy = lastVY * 120;
            const friction = 0.92;
            const minSpeed = 0.5;
            cancelInertia();
            inertiaRAF = requestAnimationFrame(step);
            function step() {
                vx *= friction;
                vy *= friction;
                offsetX += vx;
                offsetY += vy;
                if (minX > -Infinity) {
                    if (offsetX < minX) {
                        offsetX = minX;
                        vx = -vx * 0.4;
                    } else if (offsetX > maxX) {
                        offsetX = maxX;
                        vx = -vx * 0.4;
                    }
                    if (offsetY < minY) {
                        offsetY = minY;
                        vy = -vy * 0.4;
                    } else if (offsetY > maxY) {
                        offsetY = maxY;
                        vy = -vy * 0.4;
                    }
                }
                character.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
                const s = Math.min(1, Math.sqrt(vx * vx + vy * vy) / 100);
                const shadow = 12 + s * 28;
                const tiltY = Math.max(-15, Math.min(15, vx / 12));
                const tiltX = Math.max(-15, Math.min(15, -vy / 12));
                sticker.style.transition = 'none';
                sticker.style.transform = `scale(1.06) perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
                sticker.style.filter = `drop-shadow(0 ${shadow}px ${shadow * 1.6}px rgba(0,0,0,0.28))`;
                if (Math.abs(vx) > minSpeed || Math.abs(vy) > minSpeed) {
                    inertiaRAF = requestAnimationFrame(step);
                } else {
                    sticker.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    sticker.style.transform = '';
                    sticker.style.filter = '';
                    floatInner.style.animation = '';
                    character.style.zIndex = '5';
                    character.style.transition = '';
                    localStorage.setItem('stickerPos', JSON.stringify({ x: offsetX, y: offsetY }));
                }
            }
        }

        function cancelInertia() {
            if (inertiaRAF) {
                cancelAnimationFrame(inertiaRAF);
                inertiaRAF = null;
            }
        }

        function computeBounds() {
            const rect = character.getBoundingClientRect();
            const margin = 8;
            minX = -rect.left + margin;
            maxX = window.innerWidth - rect.right - margin;
            minY = -rect.top + margin;
            maxY = window.innerHeight - rect.bottom - margin;
        }

        window.addEventListener('resize', () => {
            computeBounds();
            offsetX = Math.max(minX, Math.min(maxX, offsetX));
            offsetY = Math.max(minY, Math.min(maxY, offsetY));
            character.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            localStorage.setItem('stickerPos', JSON.stringify({ x: offsetX, y: offsetY }));
        }
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
