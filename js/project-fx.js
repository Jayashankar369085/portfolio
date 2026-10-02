/* ==================================================
   CARD INTERACTIONS
   Pointer-following light + micro 3D tilt for:
   project slabs, My Coding Stuff cards, and
   experience timeline cards. Highlight cards and
   achievement milestones get the cursor glow only.
   Delegated listeners; zero per-card listeners.
   Desktop (fine pointer) only.
================================================== */

const ProjectFX = (() => {

    function init() {

        if (!MotionUtils.pointerEffectsEnabled) {
            return;
        }

        initProjectSlabs();
        initCodingCards();
        initExperienceCards();
        initGlowOnly();
    }


    /* ---------- Project slabs ---------- */

    function initProjectSlabs() {

        const container =
            document.querySelector(".project-slabs");

        if (!container) {
            return;
        }

        let activeCard = null;
        let pendingEvent = null;

        function applyPointer() {

            if (!activeCard || !pendingEvent) {
                return;
            }

            const rect = activeCard.getBoundingClientRect();

            const px =
                ((pendingEvent.clientX - rect.left) /
                    rect.width) * 100;

            const py =
                ((pendingEvent.clientY - rect.top) /
                    rect.height) * 100;

            activeCard.style.setProperty(
                "--pointer-x", `${px.toFixed(1)}%`
            );

            activeCard.style.setProperty(
                "--pointer-y", `${py.toFixed(1)}%`
            );

            /* Micro tilt: follows the cursor within the slab. */
            const rotateY =
                ((px / 100) - 0.5) * 4;

            const rotateX =
                (0.5 - (py / 100)) * 3;

            activeCard.style.transform =
                `perspective(1100px) rotateX(${rotateX.toFixed(2)}deg) ` +
                `rotateY(${rotateY.toFixed(2)}deg) translateY(-5px)`;

            pendingEvent = null;
        }


        container.addEventListener(
            "mousemove",
            event => {

                const slab = event.target.closest(".project-slab");

                if (slab !== activeCard) {

                    if (activeCard) {
                        resetCard(activeCard);
                    }

                    activeCard = slab;
                }

                if (slab) {
                    pendingEvent = event;
                    requestAnimationFrame(applyPointer);
                }
            },
            { passive: true }
        );


        container.addEventListener(
            "mouseleave",
            () => {

                if (activeCard) {
                    resetCard(activeCard);
                    activeCard = null;
                }
            },
            { passive: true }
        );


        function resetCard(slab) {

            slab.style.transform = "";
        }
    }


    /* ---------- My Coding Stuff cards ----------
       Same tilt + pointer glow, slightly stronger — these
       are big standalone cards and can carry more motion. */

    function initCodingCards() {

        let activeCard = null;

        document.addEventListener("mousemove", event => {

            const card = event.target.closest(".code-profile-card");

            if (card !== activeCard) {

                if (activeCard) {
                    activeCard.style.transform = "";
                    activeCard.style.setProperty("--pointer-x", "50%");
                    activeCard.style.setProperty("--pointer-y", "50%");
                }

                activeCard = card;
            }

            if (!card) {
                return;
            }

            const rect = card.getBoundingClientRect();

            const px =
                ((event.clientX - rect.left) / rect.width) * 100;

            const py =
                ((event.clientY - rect.top) / rect.height) * 100;

            card.style.setProperty("--pointer-x", `${px.toFixed(1)}%`);
            card.style.setProperty("--pointer-y", `${py.toFixed(1)}%`);

            const rotateY = ((px / 100) - 0.5) * 7;
            const rotateX = (0.5 - (py / 100)) * 5;

            card.style.transform =
                `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) ` +
                `rotateY(${rotateY.toFixed(2)}deg) translateY(-8px)`;

        }, { passive: true });

        document.addEventListener("mouseleave", () => {

            if (activeCard) {
                activeCard.style.transform = "";
                activeCard = null;
            }
        }, { passive: true });
    }


    /* ---------- Experience timeline cards ----------
       Gentle tilt only — timeline cards are content-dense,
       so glow follows the pointer but there is no lift. */

    function initExperienceCards() {

        let activeCard = null;

        document.addEventListener("mousemove", event => {

            const card = event.target.closest(".experience-card");

            if (card !== activeCard) {

                if (activeCard) {
                    activeCard.style.transform = "";
                    activeCard.style.setProperty("--pointer-x", "50%");
                    activeCard.style.setProperty("--pointer-y", "50%");
                }

                activeCard = card;
            }

            if (!card) {
                return;
            }

            const rect = card.getBoundingClientRect();

            const px =
                ((event.clientX - rect.left) / rect.width) * 100;

            const py =
                ((event.clientY - rect.top) / rect.height) * 100;

            card.style.setProperty("--pointer-x", `${px.toFixed(1)}%`);
            card.style.setProperty("--pointer-y", `${py.toFixed(1)}%`);

            const rotateY = ((px / 100) - 0.5) * 4;
            const rotateX = (0.5 - (py / 100)) * 3;

            card.style.transform =
                `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) ` +
                `rotateY(${rotateY.toFixed(2)}deg)`;

        }, { passive: true });

        document.addEventListener("mouseleave", () => {

            if (activeCard) {
                activeCard.style.transform = "";
                activeCard = null;
            }
        }, { passive: true });
    }


    /* ---------- Glow-only surfaces ----------
       Timeline entries and achievement milestones get the
       cursor-reactive wash but no tilt — too small to tilt
       without feeling twitchy. */

    function initGlowOnly() {

        let activeCard = null;

        document.addEventListener("mousemove", event => {

            const card = event.target.closest(
                ".highlight-entry, .milestone"
            );

            if (card !== activeCard) {

                if (activeCard) {
                    activeCard.style.setProperty("--pointer-x", "50%");
                    activeCard.style.setProperty("--pointer-y", "50%");
                }

                activeCard = card;
            }

            if (!card) {
                return;
            }

            const rect = card.getBoundingClientRect();

            const px =
                ((event.clientX - rect.left) / rect.width) * 100;

            const py =
                ((event.clientY - rect.top) / rect.height) * 100;

            card.style.setProperty("--pointer-x", `${px.toFixed(1)}%`);
            card.style.setProperty("--pointer-y", `${py.toFixed(1)}%`);

        }, { passive: true });

        document.addEventListener("mouseleave", () => {

            if (activeCard) {
                activeCard.style.setProperty("--pointer-x", "50%");
                activeCard.style.setProperty("--pointer-y", "50%");
                activeCard = null;
            }
        }, { passive: true });
    }


    return { init };
})();
