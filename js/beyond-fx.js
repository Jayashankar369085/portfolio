/* ==================================================
   BEYOND FX — "Beyond the Code" cars section
   Scroll-speed lines, glow parallax, Defender
   drive-by tilt and exhaust particles. Desktop,
   motion-allowed only; everything else degrades
   to the static CSS scene.
================================================== */

const BeyondFX = (() => {

    if (!MotionUtils.pointerEffectsEnabled) {
        return { init: () => {} };
    }

    /* ---------- Scroll-speed lines ----------
       Streaks that fly across the section backdrop,
       echoing the hero particles but horizontal. */

    function initSpeedLines() {

        const lane = document.getElementById("beyondSpeedLines");

        if (!lane || lane.childElementCount > 0) {
            return;
        }

        for (let i = 0; i < 14; i++) {

            const line = document.createElement("span");

            line.style.top = (4 + Math.random() * 86).toFixed(1) + "%";

            line.style.setProperty(
                "--h", `${Math.round(36 + Math.random() * 76)}px`
            );

            line.style.setProperty(
                "--dur", `${(2.4 + Math.random() * 2.4).toFixed(2)}s`
            );

            /* Negative delay desynchronises the loop start. */

            line.style.setProperty(
                "--delay", `${(-Math.random() * 4.5).toFixed(2)}s`
            );

            lane.appendChild(line);
        }
    }


    /* ---------- Backdrop glow parallax ---------- */

    function initGlowParallax() {

        const glow = document.querySelector(".beyond-glow");

        if (!glow) {
            return;
        }

        MotionUtils.onScroll(() => {

            glow.style.transform =
                `translateY(${(window.scrollY * 0.08).toFixed(1)}px)`;
        });
    }


    /* ---------- Defender drive-by + exhaust ----------
       Hovering the scene leans the car toward the
       cursor (steering into it) and kicks out exhaust
       puffs from the rear. */

    function initDefender() {

        const scene = document.getElementById("defenderScene");
        const car = document.getElementById("defenderCar");

        if (!scene || !car) {
            return;
        }

        let pendingEvent = null;
        let rafPending = false;

        function applyTilt() {

            rafPending = false;

            if (!pendingEvent) {
                return;
            }

            const rect = scene.getBoundingClientRect();

            const px =
                (pendingEvent.clientX - rect.left) / rect.width - 0.5;

            const py =
                (pendingEvent.clientY - rect.top) / rect.height - 0.5;

            car.style.transform =
                `translateY(-12px) translateX(${(px * 18).toFixed(1)}px) ` +
                `rotate(${(px * 3.2).toFixed(2)}deg) ` +
                `rotateY(${(px * 10).toFixed(2)}deg) ` +
                `rotateX(${(-py * 5).toFixed(2)}deg)`;
        }

        scene.addEventListener(
            "mousemove",
            event => {

                pendingEvent = event;

                if (!rafPending) {
                    rafPending = true;
                    requestAnimationFrame(applyTilt);
                }
            },
            { passive: true }
        );

        scene.addEventListener(
            "mouseleave",
            () => {

                pendingEvent = null;
                car.style.transform = "";
            },
            { passive: true }
        );


        /* ---------- Exhaust particles ---------- */

        const dust = document.getElementById("defenderDust");

        if (!dust) {
            return;
        }

        let puffer = null;

        function puff() {

            const particle = document.createElement("span");

            particle.className = "dust-particle";

            particle.style.setProperty(
                "--dx", `${Math.round(30 + Math.random() * 70)}px`
            );

            particle.style.setProperty(
                "--scale", (0.8 + Math.random() * 1.6).toFixed(2)
            );

            particle.style.setProperty(
                "--dur", `${(0.9 + Math.random() * 0.8).toFixed(2)}s`
            );

            particle.style.left =
                (8 + Math.random() * 14).toFixed(0) + "%";

            dust.appendChild(particle);

            particle.addEventListener("animationend", () => {
                particle.remove();
            });

            if (dust.childElementCount > 16) {
                dust.firstElementChild.remove();
            }
        }

        scene.addEventListener("pointerenter", () => {
            puff();
            puffer = setInterval(puff, 380);
        });

        scene.addEventListener("pointerleave", () => {
            clearInterval(puffer);
        });
    }


    function init() {

        initSpeedLines();
        initGlowParallax();
        initDefender();
    }


    return { init };
})();
