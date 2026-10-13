/* ==================================================
   CUSTOM CURSOR + MAGNETIC ELEMENTS
   Dot + trailing ring, state-driven labels, click
   bounce, magnetic attraction. Desktop (fine pointer,
   motion allowed) only — native cursor untouched on
   touch devices and under reduced motion.
================================================== */

const Cursor = (() => {

    if (!MotionUtils.pointerEffectsEnabled) {
        return { init: () => {} };
    }

    const dot = document.getElementById("cursorDot");
    const ring = document.getElementById("cursorRing");
    const label = document.getElementById("cursorLabel");

    if (!dot || !ring) {
        return { init: () => {} };
    }


    /* ---------- Ring interpolation state ---------- */

    let dotX = window.innerWidth / 2;
    let dotY = window.innerHeight / 2;
    let ringX = dotX;
    let ringY = dotY;
    let ringScale = 1;
    let targetRingScale = 1;

    let visible = false;
    let pressed = false;
    let downScale = 1;
    let pressedTime = 0;

    /* Set by hover targets: { state, text } */
    let cursorState = { state: "default", text: "" };


    /* ---------- State definitions ---------- */

    const STATE_LABELS = {
        project: "VIEW PROJECT →",
        explore: "EXPLORE",
        view: "VIEW"
    };


    function applyStateToElements() {

        const { state, text } = cursorState;

        label.textContent = STATE_LABELS[state] || text || "";

        dot.dataset.state = state;
        ring.dataset.state = state;
        label.dataset.state = state;

        targetRingScale =
            state === "project" ? 3.4 :
            state === "explore" ? 2.6 :
            state === "link" ? 1.55 :
            state === "text" ? 0.62 :
            state === "hidden" ? 0 : 1;
    }


    /* ---------- Interaction wiring (event delegation) ---------- */

    function isMagneticCandidate(element) {
        return element.closest(
            ".magnetic, .btn-primary-custom, .btn-outline-custom, " +
            ".theme-button, .social-links a, .filter-btn, " +
            ".navbar-brand, .footer a, .contact-cta-button, " +
            ".slab-open, .detail-back, .detail-close, " +
            ".detail-cta, .detail-next"
        );
    }


    function updateCursorState(event) {

        const target = event.target;

        const projectCard = target.closest(".project-slab");

        if (projectCard) {
            cursorState = { state: "project", text: "" };
            applyStateToElements();
            return;
        }

        const labelled = target.closest("[data-cursor]");

        if (labelled) {
            cursorState = {
                state: labelled.dataset.cursor,
                text: labelled.dataset.cursorText || ""
            };
            applyStateToElements();
            return;
        }

        const interactive = target.closest(
            "a, button, [role='button'], input, textarea, select, label"
        );

        if (interactive) {
            cursorState = { state: "link", text: "" };
            applyStateToElements();
            return;
        }

        const textElement = target.closest(
            "p, h1, h2, h3, h4, h5, h6, span, pre, li"
        );

        if (textElement) {
            cursorState = { state: "text", text: "" };
            applyStateToElements();
            return;
        }

        cursorState = { state: "default", text: "" };
        applyStateToElements();
    }


    document.addEventListener(
        "mousemove",
        updateCursorState,
        { passive: true }
    );


    document.addEventListener(
        "mouseleave",
        () => {
            visible = false;
            document.body.dataset.cursorVisible = "false";
        }
    );

    document.addEventListener(
        "mouseenter",
        () => {
            visible = true;
            document.body.dataset.cursorVisible = "true";
        }
    );

    document.addEventListener(
        "mousedown",
        () => {
            pressed = true;
            pressedTime = performance.now();
        }
    );

    document.addEventListener(
        "mouseup",
        () => {
            pressed = false;
        }
    );


    /* ---------- Per-frame smoothing ---------- */

    MotionUtils.onFrame(delta => {

        /* Dot follows quickly, ring trails behind — smooth lag. */
        const dotEase = 1 - Math.pow(0.0001, delta);
        const ringEase = 1 - Math.pow(0.006, delta);
        const scaleEase = 1 - Math.pow(0.004, delta);

        dotX = MotionUtils.lerp(dotX, MotionUtils.pointer.x, dotEase);
        dotY = MotionUtils.lerp(dotY, MotionUtils.pointer.y, dotEase);

        ringX = MotionUtils.lerp(ringX, MotionUtils.pointer.x, ringEase);
        ringY = MotionUtils.lerp(ringY, MotionUtils.pointer.y, ringEase);

        /* Click bounce: quick squash, springy release. */
        if (pressed) {
            downScale = MotionUtils.lerp(downScale, 0.78, 0.35);
        } else {
            const elapsed = (performance.now() - pressedTime) / 1000;
            const spring = Math.max(0, 0.12 * Math.exp(-elapsed * 6) *
                Math.cos(elapsed * 28));
            downScale = MotionUtils.lerp(downScale, 1 + spring, 0.3);
        }

        ringScale = MotionUtils.lerp(ringScale, targetRingScale, scaleEase);

        dot.style.transform =
            `translate3d(${dotX}px, ${dotY}px, 0) ` +
            `translate(-50%, -50%) scale(${downScale})`;

        ring.style.transform =
            `translate3d(${ringX}px, ${ringY}px, 0) ` +
            `translate(-50%, -50%) scale(${ringScale * downScale})`;

        /* Label rides inside the expanded ring. */
        label.style.transform =
            `translate3d(${ringX}px, ${ringY}px, 0) ` +
            `translate(-50%, -50%)`;
    });


    /* ---------- Magnetic elements ---------- */

    const MAGNET_STRENGTH = 0.35;
    const MAGNET_MAX_SHIFT = 9; /* px — restrained, premium. */

    function initMagneticElements() {

        const elements = document.querySelectorAll(
            ".magnetic, .btn-primary-custom, .btn-outline-custom, " +
            ".theme-button, .social-links a, .filter-btn, " +
            ".navbar-brand, .footer a, .contact-cta-button, " +
            ".slab-open, .detail-back, .detail-close, " +
            ".detail-cta, .detail-next"
        );

        const tracked = [];

        elements.forEach(element => {

            /* Skip elements inside a 3D-tilting card — double transforms
               fight each other. */
            if (element.closest(".developer-card, .profile-tilt")) {
                return;
            }

            tracked.push({
                element,
                x: 0,
                y: 0,
                active: false
            });

            element.classList.add("magnetic-initialized");
        });

        if (tracked.length === 0) {
            return;
        }


        MotionUtils.onPointerMove(pointer => {

            tracked.forEach(item => {

                const rect = item.element.getBoundingClientRect();

                /* Cheap proximity test before computing anything heavy. */
                const withinRange =
                    pointer.x > rect.left - 90 &&
                    pointer.x < rect.right + 90 &&
                    pointer.y > rect.top - 90 &&
                    pointer.y < rect.bottom + 90;

                if (!withinRange) {

                    if (item.active) {
                        item.active = false;
                        item.x = 0;
                        item.y = 0;
                        item.element.style.transform = "";
                    }

                    return;
                }

                item.active = true;

                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                const dx = pointer.x - centerX;
                const dy = pointer.y - centerY;

                item.x = MotionUtils.clamp(
                    dx * MAGNET_STRENGTH, -MAGNET_MAX_SHIFT, MAGNET_MAX_SHIFT
                );

                item.y = MotionUtils.clamp(
                    dy * MAGNET_STRENGTH, -MAGNET_MAX_SHIFT, MAGNET_MAX_SHIFT
                );
            });
        });


        MotionUtils.onFrame(() => {

            tracked.forEach(item => {

                if (!item.active) {
                    return;
                }

                const currentX = parseFloat(
                    item.element.dataset.magX || "0"
                );

                const currentY = parseFloat(
                    item.element.dataset.magY || "0"
                );

                const easedX = MotionUtils.lerp(currentX, item.x, 0.18);
                const easedY = MotionUtils.lerp(currentY, item.y, 0.18);

                item.element.dataset.magX = String(easedX);
                item.element.dataset.magY = String(easedY);

                item.element.style.transform =
                    `translate3d(${easedX}px, ${easedY}px, 0)`;
            });
        });
    }


    function init() {
        initMagneticElements();
    }


    return { init };
})();
