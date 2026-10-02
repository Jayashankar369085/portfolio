/* ==================================================
   PRELOADER
   Short premium intro: "J" -> "JAYASHANKAR" -> reveal.
   Self-dismisses quickly; reduced-motion skips entirely.
================================================== */

const Preloader = (() => {

    const root = document.getElementById("preloader");
    const letters = document.getElementById("preloaderLetters");

    /* Very short on purpose — users should never wait to see the site. */
    const totalDuration = 1100;

    function skip() {

        if (!root) {
            return;
        }

        root.remove();
        document.body.classList.remove("preload-active");
        document.body.classList.add("loaded");
    }


    function play() {

        if (!root || !letters) {
            skip();
            return;
        }

        /* Reduced motion: never block the content. */
        if (MotionUtils.prefersReducedMotion) {
            skip();
            return;
        }

        document.body.classList.add("preload-active");

        /* Stage 1: the lone "J" breathes in. */
        requestAnimationFrame(() => root.classList.add("preloader-ready"));

        /* Stage 2: remaining letters slide in after the J lands. */
        setTimeout(() => root.classList.add("preloader-expand"), 450);

        /* Stage 3: curtain lifts, site revealed. */
        setTimeout(() => {

            root.classList.add("preloader-exit");

            document.body.classList.remove("preload-active");
            document.body.classList.add("loaded");

        }, totalDuration);

        /* Stage 4: remove from DOM so it can never intercept clicks. */
        setTimeout(() => root.remove(), totalDuration + 700);
    }


    /* Safety net: even if something goes wrong, remove after 2.5s max. */
    setTimeout(skip, 2500);

    return { play };
})();
