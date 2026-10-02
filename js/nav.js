/* ==================================================
   NAVIGATION
   Glass navbar after scroll, active section indicator
   with animated pill, smooth anchor scrolling,
   mobile menu handling.
================================================== */

const Nav = (() => {

    function initScrollState() {

        const navbar = document.querySelector(".navbar");

        if (!navbar) {
            return;
        }

        MotionUtils.onScroll(state => {
            navbar.classList.toggle(
                "navbar-scrolled",
                state.y > 24
            );
        });
    }


    function initActiveSection() {

        const links =
            Array.from(
                document.querySelectorAll(".navbar-nav .nav-link[href^='#']")
            );

        if (links.length === 0) {
            return;
        }

        const indicator = document.getElementById("navIndicator");

        const sections = links
            .map(link => {

                const id = link.getAttribute("href").slice(1);

                const section = document.getElementById(id);

                return section ? { link, section } : null;
            })
            .filter(Boolean);


        if (sections.length === 0) {
            return;
        }


        let activeLink = null;

        function setActive(link, animateIndicator) {

            if (link === activeLink) {
                return;
            }

            links.forEach(item =>
                item.classList.toggle("active", item === link)
            );

            activeLink = link;

            if (indicator && link && animateIndicator) {

                const linkRect = link.getBoundingClientRect();
                const navRect = link.closest(".navbar-nav")
                    .getBoundingClientRect();

                indicator.style.width =
                    `${linkRect.width}px`;

                indicator.style.transform =
                    `translateX(${linkRect.left - navRect.left}px)`;
                indicator.style.opacity = "1";

            } else if (indicator && !link) {

                indicator.style.opacity = "0";
            }
        }


        const observer = new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) {
                        return;
                    }

                    const match =
                        sections.find(
                            item => item.section === entry.target
                        );

                    if (match) {
                        setActive(match.link, true);
                    }
                });

            },
            {
                rootMargin: "-38% 0px -55% 0px",
                threshold: 0
            }
        );

        sections.forEach(item => observer.observe(item.section));


        /* Bottom of page => contact is always active. */
        MotionUtils.onScroll(state => {

            const nearBottom =
                state.y + window.innerHeight >=
                document.documentElement.scrollHeight - 40;

            if (nearBottom) {

                const contactLink =
                    links.find(
                        link => link.getAttribute("href") === "#contact"
                    );

                if (contactLink) {
                    setActive(contactLink, true);
                }
            }
        });
    }


    /* Smooth scrolling keeps native feel but is eased + respects
       the fixed navbar height. */
    function initSmoothScroll() {

        document.addEventListener(
            "click",
            event => {

                const anchor = event.target.closest(
                    "a[href^='#']"
                );

                if (!anchor) {
                    return;
                }

                const targetId = anchor.getAttribute("href");

                if (targetId === "#" || targetId.length < 2) {
                    return;
                }

                const targetElement =
                    document.querySelector(targetId);

                if (!targetElement) {
                    return;
                }

                event.preventDefault();

                const reduced =
                    MotionUtils.prefersReducedMotion;

                targetElement.scrollIntoView({
                    behavior: reduced ? "auto" : "smooth",
                    block: "start"
                });

                history.replaceState(
                    null, "", targetId
                );
            }
        );
    }


    /* Mobile: collapse menu after a link is tapped. */
    function initMobileMenu() {

        const navLinks =
            document.querySelectorAll("#navbarMenu .nav-link");

        navLinks.forEach(link => {

            link.addEventListener("click", () => {

                if (
                    window.innerWidth < 992 &&
                    typeof bootstrap !== "undefined"
                ) {

                    const menu =
                        document.getElementById("navbarMenu");

                    if (menu && menu.classList.contains("show")) {

                        bootstrap.Collapse
                            .getOrCreateInstance(menu)
                            .hide();
                    }
                }
            });
        });
    }


    function init() {

        initScrollState();
        initActiveSection();
        initSmoothScroll();
        initMobileMenu();
    }


    return { init };
})();
