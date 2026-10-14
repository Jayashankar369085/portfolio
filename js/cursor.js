/* ==================================================
   CUSTOM CURSOR + MAGNETIC ELEMENTS
   A compact top-down sports car follows the pointer
   with a slight steering tilt, state-driven labels,
   click bounce, magnetic attraction. Desktop (fine
   pointer, motion allowed) only — native cursor
   untouched on touch devices and under reduced motion.
================================================== */

const Cursor = (() => {

    if (!MotionUtils.pointerEffectsEnabled) {
        return { init: () => {} };
    }

    const car = document.getElementById("cursorCar");
    const label = document.getElementById("cursorLabel");

    if (!car || !label) {
        return { init: () => {} };
    }


    /* ---------- Car interpolation state ---------- */

    let carX = window.innerWidth / 2;
    let carY = window.innerHeight / 2;

    /* Previous pointer x — steering comes from the
       horizontal delta between frames. */
    let prevPointerX = MotionUtils.pointer.x;
    let tilt = 0;

    let pressed = false;
    let downScale = 1;
    let pressedTime = 0;

    let stateScale = 1;
    let targetScale = 1;

    /* Set by hover targets: { state, text } */
    let cursorState = { state: "default", text: "" };


    /* ---------- State definitions ---------- */

    const STATE_LABELS = {
        project: "VIEW PROJECT →",
        explore: "EXPLORE",
        view: "VIEW"
    };

    /* Restrained scale-up on interactive targets — the
       brighter glow lives in CSS via [data-state]. */
    const STATE_SCALES = {
        project: 1.18,
        explore: 1.16,
        view: 1.16,
        link: 1.1,
        text: 0.88,
        native: 1,
        hidden: 0,
        default: 1
    };


    function applyStateToElements() {

        const { state, text } = cursorState;

        label.textContent = STATE_LABELS[state] || text || "";

        car.dataset.state = state;
        label.dataset.state = state;

        targetScale =
            Object.prototype.hasOwnProperty.call(STATE_SCALES, state)
                ? STATE_SCALES[state]
                : 1;
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

        /* Text entry: park the car and hand the pointer
           back to the native I-beam (CSS keys off this
           state too). Checkbox/radio stay custom. */
        const textInput = target.closest(
            "input:not([type='checkbox']):not([type='radio']):" +
            "not([type='button']):not([type='submit']):not([type='reset']), " +
            "textarea, select, [contenteditable]:not([contenteditable='false'])"
        );

        if (textInput) {
            cursorState = { state: "native", text: "" };
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
            document.body.dataset.cursorVisible = "false";
        }
    );

    document.addEventListener(
        "mouseenter",
        () => {
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

        /* Fast follow — minimal latency, still smooth. */
        const posEase = 1 - Math.pow(0.000001, delta);
        const tiltEase = 1 - Math.pow(0.0005, delta);
        const scaleEase = 1 - Math.pow(0.004, delta);

        /* Slight steering: horizontal pointer delta → restrained
           yaw, settling back to straight when the pointer rests. */
        const stepX = MotionUtils.pointer.x - prevPointerX;
        prevPointerX = MotionUtils.pointer.x;

        const targetTilt = MotionUtils.clamp(stepX * 0.55, -9, 9);
        tilt = MotionUtils.lerp(tilt, targetTilt, tiltEase);

        carX = MotionUtils.lerp(carX, MotionUtils.pointer.x, posEase);
        carY = MotionUtils.lerp(carY, MotionUtils.pointer.y, posEase);

        /* Click bounce: quick squash, springy release. */
        if (pressed) {
            downScale = MotionUtils.lerp(downScale, 0.82, 0.35);
        } else {
            const elapsed = (performance.now() - pressedTime) / 1000;
            const spring = Math.max(0, 0.12 * Math.exp(-elapsed * 6) *
                Math.cos(elapsed * 28));
            downScale = MotionUtils.lerp(downScale, 1 + spring, 0.3);
        }

        stateScale = MotionUtils.lerp(stateScale, targetScale, scaleEase);

        /* Hotspot (front-centre of the car) stays glued to the
           pointer — see transform-origin in effects.css. */
        car.style.transform =
            `translate3d(${carX}px, ${carY}px, 0) ` +
            `translate(-50%, -10%) ` +
            `rotate(${tilt}deg) ` +
            `scale(${stateScale * downScale})`;

        /* Label rides just below the car. */
        label.style.transform =
            `translate3d(${carX}px, ${carY}px, 0) ` +
            `translate(-50%, -50%) translateY(54px)`;
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

        /* Tells CSS it may hide the native cursor — only ever set
           on fine pointers with motion allowed (see top guard). */
        document.body.dataset.cursorActive = "true";

        initMagneticElements();
    }


    return { init };
})();
