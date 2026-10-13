/* ==================================================
   CUSTOM CURSOR — MINI SPORTS CAR + MAGNETIC ELEMENTS
   A single 24×30px inline-SVG car (see index.html)
   follows the pointer with a slight lag and leans into
   turns; it scales up and glows brighter over
   interactive elements and shrinks over text so it
   never covers what you are reading.

   Desktop (fine pointer, motion allowed) only — the
   native cursor is untouched on touch devices and
   under prefers-reduced-motion, and the car itself is
   pointer-events: none so it can never block a click.
================================================== */

const Cursor = (() => {

    if (!MotionUtils.pointerEffectsEnabled) {
        return { init: () => {} };
    }

    const car = document.getElementById("cursorCar");

    if (!car) {
        return { init: () => {} };
    }


    /* ---------- Tuning (premium, restrained) ---------- */

    const FOLLOW_RATE = 18;   /* position ease — subtle delay, no lag */
    const STEER_RATE = 9;     /* rotation ease — heavier than position */
    const SCALE_RATE = 14;    /* hover/press ease */

    const MAX_STEER = 28;     /* deg the nose may lean off centre */
    const IDLE_STRAIGHTEN = 0.04; /* per frame, when the pointer rests */

    const PRESS_SCALE = 0.84; /* click squash */

    const STATE_SCALES = {
        default: 1,
        interactive: 1.26,
        project: 1.3,
        text: 0.6,
        edit: 1
    };


    /* ---------- Per-frame state ---------- */

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let lastX = x;
    let lastY = y;

    let steer = 0;
    let targetSteer = 0;

    let scale = 1;
    let targetScale = STATE_SCALES.default;

    let pressFactor = 1;
    let pressed = false;
    let pressedAt = 0;

    let visible = false;
    let state = "default";


    /* ---------- Visibility ----------
       Hidden until the pointer really moves; snapping the
       position on show avoids a glide from a stale spot
       (first paint, a return to the tab, a resize). */

    function showCursor() {

        if (visible) {
            return;
        }

        visible = true;

        x = lastX = MotionUtils.clamp(
            MotionUtils.pointer.x, 0, window.innerWidth
        );
        y = lastY = MotionUtils.clamp(
            MotionUtils.pointer.y, 0, window.innerHeight
        );

        document.body.dataset.cursorVisible = "true";
        document.body.dataset.customCursor = "on";
    }


    function hideCursor() {

        if (!visible) {
            return;
        }

        visible = false;
        pressed = false;

        document.body.dataset.cursorVisible = "false";
    }


    /* ---------- Hover state (event delegation) ---------- */

    function stateFor(target) {

        if (!target || typeof target.closest !== "function") {
            return "default";
        }

        /* Editable fields hand control back to the native
           caret cursor — the car fades out entirely. */
        if (target.closest(
            "input, textarea, select, [contenteditable='true']"
        )) {
            return "edit";
        }

        if (target.closest(".project-slab")) {
            return "project";
        }

        if (target.closest(
            "[data-cursor], a, button, [role='button'], label, " +
            ".magnetic, .filter-btn, .social-links a, .slab-open, " +
            ".detail-back, .detail-close, .detail-cta, .detail-next"
        )) {
            return "interactive";
        }

        if (target.closest(
            "p, h1, h2, h3, h4, h5, h6, span, pre, li, td, blockquote"
        )) {
            return "text";
        }

        return "default";
    }


    function applyState(next) {

        if (next === state) {
            return;
        }

        state = next;
        targetScale = STATE_SCALES[next] || STATE_SCALES.default;

        car.dataset.state = next;
    }


    document.addEventListener(
        "mousemove",
        event => {

            showCursor();
            applyState(stateFor(event.target));
        },
        { passive: true }
    );


    /* ---------- Pointer leaves / window loses focus ---------- */

    document.addEventListener("mouseleave", hideCursor);

    window.addEventListener("blur", hideCursor);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            hideCursor();
        }
    });


    /* ---------- Click feedback ---------- */

    document.addEventListener("mousedown", () => {
        pressed = true;
        pressedAt = performance.now();
    }, { passive: true });

    document.addEventListener("mouseup", () => {
        pressed = false;
    }, { passive: true });


    /* ---------- Resizing ----------
       Coordinates are viewport-relative, so a resize is
       already correct; this only keeps the car inside the
       new bounds while the pointer has not moved yet. */

    window.addEventListener("resize", () => {

        x = MotionUtils.clamp(x, 0, window.innerWidth);
        y = MotionUtils.clamp(y, 0, window.innerHeight);

        lastX = MotionUtils.clamp(lastX, 0, window.innerWidth);
        lastY = MotionUtils.clamp(lastY, 0, window.innerHeight);
    }, { passive: true });


    /* ---------- Per-frame smoothing (one rAF, one node) ---------- */

    MotionUtils.onFrame(delta => {

        if (!visible) {
            return;
        }

        const dt = Math.min(Math.max(delta, 0), 0.05);

        const follow = 1 - Math.exp(-dt * FOLLOW_RATE);
        const steerEase = 1 - Math.exp(-dt * STEER_RATE);
        const scaleEase = 1 - Math.exp(-dt * SCALE_RATE);

        const pointerX = MotionUtils.clamp(
            MotionUtils.pointer.x, 0, window.innerWidth
        );
        const pointerY = MotionUtils.clamp(
            MotionUtils.pointer.y, 0, window.innerHeight
        );

        /* Steering: lean toward the direction of travel,
           clamped to a restrained angle. The nose points
           "up" at rest, so a heading of 0deg is straight. */
        const dx = pointerX - lastX;
        const dy = pointerY - lastY;

        lastX = pointerX;
        lastY = pointerY;

        if (Math.hypot(dx, dy) > 0.8) {

            let heading = Math.atan2(dy, dx) * 180 / Math.PI + 90;

            while (heading > 180) {
                heading -= 360;
            }

            while (heading < -180) {
                heading += 360;
            }

            targetSteer = MotionUtils.clamp(
                heading, -MAX_STEER, MAX_STEER
            );

        } else {
            /* At rest the car straightens out. */
            targetSteer = MotionUtils.lerp(
                targetSteer, 0, IDLE_STRAIGHTEN
            );
        }

        steer = MotionUtils.lerp(steer, targetSteer, steerEase);


        /* Click squash + springy release. */
        if (pressed) {
            pressFactor = MotionUtils.lerp(pressFactor, PRESS_SCALE, 0.35);
        } else {
            const elapsed = (performance.now() - pressedAt) / 1000;
            const spring = Math.max(
                0,
                0.1 * Math.exp(-elapsed * 6) * Math.cos(elapsed * 28)
            );
            pressFactor = MotionUtils.lerp(pressFactor, 1 + spring, 0.3);
        }


        x = MotionUtils.lerp(x, pointerX, follow);
        y = MotionUtils.lerp(y, pointerY, follow);

        scale = MotionUtils.lerp(
            scale, targetScale * pressFactor, scaleEase
        );


        /* Single transform write per frame. */
        car.style.transform =
            `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) ` +
            `translate(-50%, -50%) ` +
            `rotate(${steer.toFixed(2)}deg) ` +
            `scale(${scale.toFixed(3)})`;
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
        car.dataset.state = "default";
        initMagneticElements();
    }


    return { init };
})();
