/* ==================================================
   SHARED UTILITIES
   Small, dependency-free helpers reused by every module.
================================================== */

const MotionUtils = (() => {

    /* ---------- Environment flags ---------- */

    const prefersReducedMotion =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* Coarse pointer OR no hover support => touch-first device.
       The custom cursor and mouse-only effects are disabled there. */
    const isTouchDevice =
        window.matchMedia("(hover: none), (pointer: coarse)").matches;

    /* Fine pointer + no reduced motion => full experience allowed. */
    const pointerEffectsEnabled =
        !prefersReducedMotion && !isTouchDevice;


    /* ---------- Math ---------- */

    function lerp(current, target, factor) {
        return current + (target - current) * factor;
    }


    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }


    /* Map a value from one range to another. */
    function mapRange(value, inMin, inMax, outMin, outMax) {
        return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
    }


    /* ---------- Pointer store (single global mousemove listener) ---------- */

    const pointer = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        hasMoved: false
    };

    const pointerListeners = new Set();

    if (!isTouchDevice) {

        let pointerFrameQueued = false;

        window.addEventListener(
            "mousemove",
            event => {

                pointer.x = event.clientX;
                pointer.y = event.clientY;
                pointer.hasMoved = true;

                if (pointerFrameQueued) {
                    return;
                }

                pointerFrameQueued = true;

                requestAnimationFrame(() => {
                    pointerListeners.forEach(listener => listener(pointer));
                    pointerFrameQueued = false;
                });
            },
            { passive: true }
        );
    }


    function onPointerMove(listener) {
        if (isTouchDevice) {
            return () => {};
        }

        pointerListeners.add(listener);
        listener(pointer);

        return () => pointerListeners.delete(listener);
    }


    /* ---------- Scroll store (single passive scroll listener) ---------- */

    const scrollState = {
        y: window.scrollY,
        progress: 0
    };

    const scrollListeners = new Set();

    let scrollFrameQueued = false;

    function readScroll() {

        scrollState.y = window.scrollY;

        const maxScroll =
            document.documentElement.scrollHeight - window.innerHeight;

        scrollState.progress =
            maxScroll > 0 ? clamp(scrollState.y / maxScroll, 0, 1) : 0;
    }

    window.addEventListener(
        "scroll",
        () => {

            if (scrollFrameQueued) {
                return;
            }

            scrollFrameQueued = true;

            requestAnimationFrame(() => {
                readScroll();
                scrollListeners.forEach(listener => listener(scrollState));
                scrollFrameQueued = false;
            });
        },
        { passive: true }
    );

    readScroll();


    function onScroll(listener) {
        scrollListeners.add(listener);
        listener(scrollState);

        return () => scrollListeners.delete(listener);
    }


    /* ---------- Shared IntersectionObserver ---------- */

    const visibilityCallbacks = new WeakMap();

    let visibilityObserver = null;

    function getVisibilityObserver() {

        if (visibilityObserver) {
            return visibilityObserver;
        }

        visibilityObserver = new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    const callback =
                        visibilityCallbacks.get(entry.target);

                    if (callback) {
                        callback(entry.isIntersecting, entry);
                    }
                });
            },
            { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
        );

        return visibilityObserver;
    }


    /* Fires once when an element enters the viewport. */
    function onEnterViewport(element, callback) {

        if (prefersReducedMotion) {
            /* Without motion, treat content as immediately visible. */
            callback(true);
            return () => {};
        }

        const observer = getVisibilityObserver();

        const wrappedCallback = (isIntersecting, entry) => {

            if (!isIntersecting) {
                return;
            }

            callback(true, entry);

            observer.unobserve(element);
            visibilityCallbacks.delete(element);
        };

        visibilityCallbacks.set(element, wrappedCallback);
        observer.observe(element);

        return () => {
            observer.unobserve(element);
            visibilityCallbacks.delete(element);
        };
    }


    /* Fires on every enter/leave, so loops can pause off-screen. */
    function onVisibilityChange(element, callback) {

        if (visibilityObserver) {
            visibilityCallbacks.set(element, callback);
            visibilityObserver.observe(element);

            return () => {
                visibilityObserver.unobserve(element);
                visibilityCallbacks.delete(element);
            };
        }

        callback(true);
        return () => {};
    }


    /* ---------- Single shared rAF loop ---------- */

    const frameListeners = new Set();

    let rafLoopRunning = false;
    let lastFrameTime = 0;

    function runFrameLoop(timestamp) {

        const delta = Math.min((timestamp - lastFrameTime) / 1000, 0.05);
        lastFrameTime = timestamp;

        frameListeners.forEach(listener => listener(delta));

        if (frameListeners.size > 0) {
            requestAnimationFrame(runFrameLoop);
        } else {
            rafLoopRunning = false;
        }
    }


    /* Register a per-frame callback; the loop only runs while needed. */
    function onFrame(listener) {

        frameListeners.add(listener);

        if (!rafLoopRunning) {
            rafLoopRunning = true;
            lastFrameTime = performance.now();
            requestAnimationFrame(runFrameLoop);
        }

        return () => frameListeners.delete(listener);
    }


    return {
        prefersReducedMotion,
        isTouchDevice,
        pointerEffectsEnabled,
        lerp,
        clamp,
        mapRange,
        pointer,
        onPointerMove,
        onScroll,
        onEnterViewport,
        onVisibilityChange,
        onFrame
    };
})();
