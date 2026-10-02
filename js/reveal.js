/* ==================================================
   SCROLL REVEAL + SECTION MOTION
   Shared IntersectionObserver-driven reveal system.
   data-reveal       => fade-up
   data-reveal="left/right/scale/blur"
   data-reveal-delay => stagger in ms
================================================== */

const Reveal = (() => {

    function init() {

        const targets =
            document.querySelectorAll("[data-reveal]");

        if (MotionUtils.prefersReducedMotion) {
            /* Everything simply visible. */
            targets.forEach(target =>
                target.classList.add("reveal-visible")
            );
            return;
        }

        const observer = new IntersectionObserver(
            (entries, obs) => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) {
                        return;
                    }

                    const element = entry.target;

                    const delay =
                        parseInt(
                            element.dataset.revealDelay || "0", 10
                        );

                    if (delay > 0) {
                        element.style.transitionDelay = `${delay}ms`;
                    }

                    element.classList.add("reveal-visible");

                    obs.unobserve(element);

                    /* Safety net: if transitions are throttled or
                       unavailable, content must never stay hidden. */
                    setTimeout(() => {

                        if (
                            element.classList.contains(
                                "reveal-visible"
                            ) &&
                            parseFloat(
                                getComputedStyle(element).opacity
                            ) < 0.5
                        ) {
                            element.style.transition = "none";
                            element.style.opacity = "1";
                            element.style.transform = "none";
                            element.style.filter = "none";
                        }

                    }, 1400 + delay);
                });

            },
            { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
        );

        targets.forEach(target => observer.observe(target));
    }


    /* Heading underline sweep when a section enters. */
    function initHeadingLines() {

        const headings =
            document.querySelectorAll(".section-heading h2");

        if (MotionUtils.prefersReducedMotion) {
            return;
        }

        headings.forEach(heading => {

            MotionUtils.onEnterViewport(
                heading,
                () => heading.classList.add("heading-line-visible")
            );
        });
    }


    /* Parallax drift for decorative glows. */
    function initParallax() {

        if (MotionUtils.prefersReducedMotion ||
            !MotionUtils.pointerEffectsEnabled) {
            return;
        }

        const elements =
            document.querySelectorAll("[data-parallax]");

        if (elements.length === 0) {
            return;
        }

        const tracked = Array.from(elements).map(element => ({
            element,
            speed: parseFloat(
                element.dataset.parallax || "0.1"
            )
        }));


        MotionUtils.onScroll(state => {

            const viewportCenter =
                state.y + window.innerHeight / 2;

            tracked.forEach(item => {

                const rect = item.element.getBoundingClientRect();

                const elementCenter =
                    rect.top + rect.height / 2 + state.y;

                const offset =
                    (elementCenter - viewportCenter) * item.speed;

                item.element.style.transform =
                    `translate3d(0, ${offset.toFixed(1)}px, 0)`;
            });
        });
    }


    return { init, initHeadingLines, initParallax };
})();
