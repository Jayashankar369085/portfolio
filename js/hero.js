/* ==================================================
   HERO MODULE
   Interactive 3D developer card, cursor spotlight,
   reactive background particles, entrance choreography,
   scroll progress bar.
================================================== */

const Hero = (() => {

    let spotlightFrameListener = null;
    let spotlightPointerListener = null;

    function initSpotlight() {

        const spotlight =
            document.getElementById("cursorSpotlight");

        if (!spotlight || !MotionUtils.pointerEffectsEnabled) {
            return;
        }

        let targetX = window.innerWidth / 2;
        let targetY = window.innerHeight * 0.3;
        let currentX = targetX;
        let currentY = targetY;
        let dirty = false;

        spotlightPointerListener = MotionUtils.onPointerMove(pointer => {
            targetX = pointer.x;
            targetY = pointer.y;
            dirty = true;
        });

        spotlightFrameListener = MotionUtils.onFrame(() => {

            if (!dirty) {
                return;
            }

            currentX = MotionUtils.lerp(currentX, targetX, 0.12);
            currentY = MotionUtils.lerp(currentY, targetY, 0.12);

            spotlight.style.transform =
                `translate3d(${currentX - 300}px, ${currentY - 300}px, 0)`;

            if (
                Math.abs(currentX - targetX) < 0.5 &&
                Math.abs(currentY - targetY) < 0.5
            ) {
                dirty = false;
            }
        });
    }


    function initCardTilt() {

        const card = document.getElementById("developerCard");
        const cardScene = document.getElementById("developerCardScene");

        if (!card || !cardScene || !MotionUtils.pointerEffectsEnabled) {
            return;
        }

        let targetRotY = 0;
        let targetRotX = 0;
        let currentRotY = 0;
        let currentRotX = 0;
        let targetGlowX = 50;
        let targetGlowY = 50;
        let currentGlowX = 50;
        let currentGlowY = 50;
        let isNear = false;

        /* Compute the card center once per pointer move — cheap. */
        MotionUtils.onPointerMove(pointer => {

            const rect = cardScene.getBoundingClientRect();

            const near =
                pointer.x > rect.left - 260 &&
                pointer.x < rect.right + 260 &&
                pointer.y > rect.top - 260 &&
                pointer.y < rect.bottom + 260;

            if (!near) {
                isNear = false;
                targetRotX = 0;
                targetRotY = 0;
                return;
            }

            isNear = true;

            const nx =
                MotionUtils.clamp(
                    (pointer.x - rect.left) / rect.width, -0.6, 1.6
                );

            const ny =
                MotionUtils.clamp(
                    (pointer.y - rect.top) / rect.height, -0.6, 1.6
                );

            /* Cursor left => card tilts left; cursor up => tilts up. */
            targetRotY = (nx - 0.5) * 14;
            targetRotX = (0.5 - ny) * 12;

            targetGlowX = MotionUtils.clamp(nx * 100, 0, 100);
            targetGlowY = MotionUtils.clamp(ny * 100, 0, 100);
        });


        MotionUtils.onFrame(() => {

            const settledRot =
                Math.abs(currentRotY - targetRotY) < 0.05 &&
                Math.abs(currentRotX - targetRotX) < 0.05;

            const settledGlow =
                Math.abs(currentGlowX - targetGlowX) < 0.5 &&
                Math.abs(currentGlowY - targetGlowY) < 0.5;

            if (!isNear && settledRot && settledGlow) {
                return;
            }

            currentRotY = MotionUtils.lerp(currentRotY, targetRotY, 0.09);
            currentRotX = MotionUtils.lerp(currentRotX, targetRotX, 0.09);

            currentGlowX = MotionUtils.lerp(currentGlowX, targetGlowX, 0.12);
            currentGlowY = MotionUtils.lerp(currentGlowY, targetGlowY, 0.12);

            card.style.transform =
                `rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;

            card.style.setProperty(
                "--card-glow-x", `${currentGlowX}%`
            );

            card.style.setProperty(
                "--card-glow-y", `${currentGlowY}%`
            );
        });
    }


    function initParticles() {

        const canvas = document.getElementById("heroParticles");

        if (!canvas || MotionUtils.prefersReducedMotion) {
            return;
        }

        const ctx = canvas.getContext("2d");

        if (!ctx) {
            return;
        }

        let particles = [];
        let canvasWidth = 0;
        let canvasHeight = 0;
        let devicePixelRatio = 1;
        let running = false;
        let stopFrame = null;
        let pointerInside = false;

        const pointerLocal = { x: -1000, y: -1000 };

        const PARTICLE_BASE_COUNT =
            window.innerWidth < 768 ? 26 : 52;

        function resizeCanvas() {

            const rect = canvas.parentElement.getBoundingClientRect();

            devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);

            canvasWidth = rect.width;
            canvasHeight = rect.height;

            canvas.width = Math.round(canvasWidth * devicePixelRatio);
            canvas.height = Math.round(canvasHeight * devicePixelRatio);

            ctx.setTransform(
                devicePixelRatio, 0, 0, devicePixelRatio, 0, 0
            );
        }


        function createParticles() {

            const count =
                Math.round(
                    PARTICLE_BASE_COUNT *
                    (canvasWidth / Math.max(window.innerWidth, 1)) +
                    (canvasWidth > 500 ? 10 : 4)
                );

            particles = Array.from({ length: count }, () => ({

                x: Math.random() * canvasWidth,
                y: Math.random() * canvasHeight,
                radius: 0.8 + Math.random() * 1.6,
                baseAlpha: 0.12 + Math.random() * 0.3,
                vx: (Math.random() - 0.5) * 7,
                vy: (Math.random() - 0.5) * 7,
                phase: Math.random() * Math.PI * 2

            }));
        }


        function drawParticles(time) {

            ctx.clearRect(0, 0, canvasWidth, canvasHeight);

            const px = pointerLocal.x;
            const py = pointerLocal.y;
            const interactive = pointerInside;

            particles.forEach(particle => {

                particle.x += particle.vx * 0.016;
                particle.y += particle.vy * 0.016;

                /* Wrap around edges. */
                if (particle.x < -10) particle.x = canvasWidth + 10;
                if (particle.x > canvasWidth + 10) particle.x = -10;
                if (particle.y < -10) particle.y = canvasHeight + 10;
                if (particle.y > canvasHeight + 10) particle.y = -10;

                let alpha = particle.baseAlpha;
                let radius = particle.radius;

                /* Cursor-reactive: brighten and gently push away. */
                if (interactive) {

                    const dx = particle.x - px;
                    const dy = particle.y - py;
                    const distance = Math.hypot(dx, dy);

                    if (distance < 130) {

                        const influence = 1 - distance / 130;

                        alpha =
                            particle.baseAlpha + influence * 0.5;

                        radius =
                            particle.radius + influence * 1.4;

                        const push = influence * 12;

                        particle.x += (dx / (distance || 1)) * push * 0.016;
                        particle.y += (dy / (distance || 1)) * push * 0.016;
                    }
                }

                /* Gentle twinkle. */
                alpha *= 0.75 + 0.25 * Math.sin(time * 0.001 + particle.phase);

                ctx.beginPath();
                ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(139, 133, 255, ${alpha.toFixed(3)})`;
                ctx.fill();
            });
        }


        let frameHandle = null;

        function startLoop() {

            if (running) {
                return;
            }

            running = true;

            const loop = time => {

                drawParticles(time);

                frameHandle = requestAnimationFrame(loop);
            };

            frameHandle = requestAnimationFrame(loop);
        }


        function stopLoop() {

            running = false;

            if (frameHandle) {
                cancelAnimationFrame(frameHandle);
                frameHandle = null;
            }
        }


        resizeCanvas();
        createParticles();

        let resizeTimer = null;

        window.addEventListener(
            "resize",
            () => {

                clearTimeout(resizeTimer);

                resizeTimer = setTimeout(() => {
                    resizeCanvas();
                    createParticles();
                }, 180);
            },
            { passive: true }
        );


        if (MotionUtils.pointerEffectsEnabled) {

            canvas.addEventListener(
                "mousemove",
                event => {

                    const rect = canvas.getBoundingClientRect();

                    pointerLocal.x = event.clientX - rect.left;
                    pointerLocal.y = event.clientY - rect.top;
                    pointerInside = true;
                },
                { passive: true }
            );

            canvas.addEventListener(
                "mouseleave",
                () => {
                    pointerInside = false;
                    pointerLocal.x = -1000;
                    pointerLocal.y = -1000;
                }
            );
        }


        /* Run only while the hero is on screen. */
        MotionUtils.onVisibilityChange(
            canvas,
            isIntersecting => {

                if (isIntersecting) {
                    startLoop();
                } else {
                    stopLoop();
                }
            }
        );

        /* Clean shutdown safety. */
        window.addEventListener(
            "pagehide",
            stopLoop
        );
    }


    function initTextChoreography() {

        const intro = document.querySelector(".hero-intro");
        const nameElement = document.getElementById("heroName");
        const role = document.querySelector(".hero-role");
        const description = document.querySelector(".hero-description");
        const buttons = document.querySelector(".hero-buttons");
        const socials = document.querySelector(".social-links");

        /* Reduced motion or missing pieces => everything just shows. */
        if (
            MotionUtils.prefersReducedMotion ||
            !nameElement
        ) {

            [intro, nameElement, role, description, buttons, socials]
                .forEach(element => {

                    if (element) {
                        element.classList.add("hero-visible");
                    }
                });

            return;
        }

        const nameText = nameElement.textContent.trim();

        /* Split the name into spans for the character reveal. */
        nameElement.innerHTML = "";

        nameText.split("").forEach((character, index) => {

            const span = document.createElement("span");

            span.className = "hero-name-character";
            span.textContent = character === " " ? "\u00A0" : character;
            span.style.transitionDelay = `${(index * 34 + 120)}ms`;

            nameElement.appendChild(span);
        });


        if (intro) {
            intro.classList.add("hero-animate");
        }

        requestAnimationFrame(() => {

            requestAnimationFrame(() => {
                document.body.classList.add("hero-reveal");
            });
        });
    }


    function initScrollProgress() {

        const bar = document.getElementById("scrollProgress");

        if (!bar) {
            return;
        }

        MotionUtils.onScroll(state => {
            bar.style.transform = `scaleX(${state.progress})`;
        });
    }


    /* ---------- Beyond the Code: mouse-reactive Defender ----------
       Subtle tilt + drift toward the cursor; the CSS keeps the
       float animation, headlights glow on hover. */

    function initDefenderTilt() {

        const scene = document.getElementById("defenderScene");
        const car = document.getElementById("defenderCar");

        if (!scene || !car) {
            return;
        }

        const state = { x: 0, y: 0, targetX: 0, targetY: 0 };
        let rafId = null;

        function animate() {

            state.x += (state.targetX - state.x) * 0.08;
            state.y += (state.targetY - state.y) * 0.08;

            car.style.transform =
                `rotateY(${state.x.toFixed(2)}deg) ` +
                `rotateX(${(-state.y).toFixed(2)}deg) ` +
                `translate(${(state.x * 1.4).toFixed(1)}px, ` +
                `${(state.y * 1.2).toFixed(1)}px)`;

            if (
                Math.abs(state.targetX - state.x) > 0.05 ||
                Math.abs(state.targetY - state.y) > 0.05
            ) {
                rafId = requestAnimationFrame(animate);
            } else {
                rafId = null;
            }
        }

        function queueAnimation() {

            if (rafId === null) {
                rafId = requestAnimationFrame(animate);
            }
        }

        scene.addEventListener("mousemove", event => {

            const rect = scene.getBoundingClientRect();

            state.targetX =
                ((event.clientX - rect.left) / rect.width - 0.5) * 14;

            state.targetY =
                ((event.clientY - rect.top) / rect.height - 0.5) * 10;

            queueAnimation();

        }, { passive: true });

        scene.addEventListener("mouseleave", () => {

            state.targetX = 0;
            state.targetY = 0;
            queueAnimation();

        }, { passive: true });
    }


    function init() {

        initSpotlight();
        initCardTilt();
        initParticles();
        initTextChoreography();
        initScrollProgress();
        initDefenderTilt();
    }


    return {
        init,
        /* Exposed so other modules can dispose cleanly if needed. */
        dispose: () => {

            if (spotlightFrameListener) {
                spotlightFrameListener();
            }

            if (spotlightPointerListener) {
                spotlightPointerListener();
            }
        }
    };
})();
