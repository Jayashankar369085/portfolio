/* ==================================================
   CONTENT MODULE
   Original behaviors from script.js — refactored,
   kept compatible with the same markup hooks:
   typing text, auto-image, project filters, lightbox.
================================================== */

const Content = (() => {

    /* ---------- Theme toggle (dark default / light persisted) ---------- */

    const THEME_STORAGE_KEY = "portfolio-theme";

    function applyTheme(isLight) {

        document.body.classList.toggle("light-theme", isLight);

        const icon = document.querySelector("#themeToggle i");

        if (icon) {
            /* Moon = currently dark, click for light. Sun = currently light. */
            icon.className = isLight ? "bi bi-sun-fill" : "bi bi-moon-fill";
        }
    }

    function initTheme() {

        const toggle = document.getElementById("themeToggle");

        applyTheme(localStorage.getItem(THEME_STORAGE_KEY) === "light");

        if (toggle) {
            toggle.addEventListener("click", () => {

                const isLight = !document.body.classList.contains("light-theme");

                applyTheme(isLight);

                try {
                    localStorage.setItem(THEME_STORAGE_KEY,
                        isLight ? "light" : "dark");
                } catch (error) {
                    /* Storage unavailable (private mode) — theme still toggles. */
                }
            });
        }
    }


    /* ---------- Typing animation (hero roles) ---------- */

    function initTyping() {

        const element = document.getElementById("typingText");

        if (!element) {
            return;
        }

        const roles = [
            "Software Developer",
            "Web Developer",
            "Flutter Developer",
            "AI/ML Enthusiast"
        ];

        let roleIndex = 0;
        let characterIndex = 0;
        let deleting = false;
        let timer = null;

        function type() {

            const currentRole = roles[roleIndex];

            if (!deleting) {

                element.textContent =
                    currentRole.substring(0, characterIndex + 1);

                characterIndex++;

                if (characterIndex === currentRole.length) {
                    deleting = true;
                    timer = setTimeout(type, 1600);
                    return;
                }

            } else {

                element.textContent =
                    currentRole.substring(0, characterIndex - 1);

                characterIndex--;

                if (characterIndex === 0) {
                    deleting = false;
                    roleIndex = (roleIndex + 1) % roles.length;
                }
            }

            timer = setTimeout(type, deleting ? 42 : 85);
        }

        type();

        /* Pause while the tab is hidden. */
        document.addEventListener("visibilitychange", () => {

            clearTimeout(timer);

            if (!document.hidden) {
                timer = setTimeout(type, 120);
            }
        });
    }


    /* ---------- Auto image extension detection ---------- */

    const SUPPORTED_EXTENSIONS = [".jpeg", ".jpg", ".png"];


    function initAutoImages() {

        const images = document.querySelectorAll(".auto-image");

        images.forEach(image => {

            const basePath = image.dataset.src;

            if (!basePath) {
                return;
            }

            let extensionIndex = 0;

            function tryNext() {

                if (extensionIndex >= SUPPORTED_EXTENSIONS.length) {

                    console.warn(`No image found for: ${basePath}`);

                    image.classList.add("image-not-found");
                    image.removeAttribute("src");
                    return;
                }

                image.src =
                    basePath + SUPPORTED_EXTENSIONS[extensionIndex];

                extensionIndex++;
            }


            image.addEventListener("error", tryNext);

            image.addEventListener("load", () => {
                image.classList.add("image-loaded");
            });

            tryNext();
        });
    }


    /* ---------- Project category filtering ---------- */

    function initProjectFilter() {

        const buttons = document.querySelectorAll(
            ".project-filters .filter-btn"
        );

        const items =
            document.querySelectorAll(".project-item");

        buttons.forEach(button => {

            button.addEventListener("click", () => {

                buttons.forEach(item =>
                    item.classList.remove("active")
                );

                button.classList.add("active");

                const category = button.dataset.filter;

                items.forEach(item => {

                    const matches =
                        category === "all" ||
                        item.dataset.category === category;

                    item.classList.toggle("hide", !matches);
                });
            });
        });
    }


    /* ---------- Lightbox (project galleries) ---------- */

    let currentImages = [];
    let currentIndex = 0;


    function getGalleryImages(image) {

        const gallery =
            image.closest(".project-gallery");

        if (!gallery) {
            return [image];
        }

        return Array.from(
            gallery.querySelectorAll(".gallery-image.image-loaded")
        );
    }


    function showImage() {

        const lightboxImage =
            document.getElementById("lightboxImage");

        const lightboxCaption =
            document.getElementById("lightboxCaption");

        const lightboxCounter =
            document.getElementById("lightboxCounter");

        const lightboxPrevious =
            document.getElementById("lightboxPrevious");

        const lightboxNext =
            document.getElementById("lightboxNext");

        if (!lightboxImage || currentImages.length === 0) {
            return;
        }

        const selected = currentImages[currentIndex];

        lightboxImage.src = selected.src;
        lightboxImage.alt = selected.alt || "Project screenshot";

        lightboxCaption.textContent = selected.alt || "";

        lightboxCounter.textContent =
            `${currentIndex + 1} / ${currentImages.length}`;

        const multiple = currentImages.length > 1;

        lightboxPrevious.style.display = multiple ? "flex" : "none";
        lightboxNext.style.display = multiple ? "flex" : "none";
    }


    function showPrevious() {

        if (currentImages.length === 0) {
            return;
        }

        currentIndex =
            (currentIndex - 1 + currentImages.length) %
            currentImages.length;

        showImage();
    }


    function showNext() {

        if (currentImages.length === 0) {
            return;
        }

        currentIndex =
            (currentIndex + 1) % currentImages.length;

        showImage();
    }


    function openLightbox(image) {

        const lightbox =
            document.getElementById("imageLightbox");

        if (!lightbox) {
            return;
        }

        currentImages = getGalleryImages(image);

        currentIndex = Math.max(
            0, currentImages.indexOf(image)
        );

        showImage();

        lightbox.classList.add("active");

        lightbox.setAttribute("aria-hidden", "false");

        document.body.classList.add("lightbox-open");
    }


    function closeLightbox() {

        const lightbox =
            document.getElementById("imageLightbox");

        if (!lightbox) {
            return;
        }

        lightbox.classList.remove("active");

        lightbox.setAttribute("aria-hidden", "true");

        document.body.classList.remove("lightbox-open");

        const lightboxImage =
            document.getElementById("lightboxImage");

        if (lightboxImage) {
            lightboxImage.src = "";
        }
    }


    function initLightbox() {

        document.addEventListener("click", event => {

            const clicked = event.target.closest(".gallery-image");

            if (
                clicked &&
                clicked.classList.contains("image-loaded")
            ) {
                openLightbox(clicked);
            }
        });


        const lightboxClose =
            document.getElementById("lightboxClose");

        const lightboxPreviousBtn =
            document.getElementById("lightboxPrevious");

        const lightboxNextBtn =
            document.getElementById("lightboxNext");

        const lightbox =
            document.getElementById("imageLightbox");


        if (lightboxClose) {

            lightboxClose.addEventListener("click", event => {
                event.stopPropagation();
                closeLightbox();
            });
        }


        if (lightboxPreviousBtn) {

            lightboxPreviousBtn.addEventListener("click", event => {
                event.stopPropagation();
                showPrevious();
            });
        }


        if (lightboxNextBtn) {

            lightboxNextBtn.addEventListener("click", event => {
                event.stopPropagation();
                showNext();
            });
        }


        if (lightbox) {

            lightbox.addEventListener("click", event => {

                if (
                    event.target === lightbox ||
                    event.target.classList.contains("lightbox-content")
                ) {
                    closeLightbox();
                }
            });
        }


        document.addEventListener("keydown", event => {

            if (
                !lightbox ||
                !lightbox.classList.contains("active")
            ) {
                return;
            }

            if (event.key === "Escape") {
                closeLightbox();
            }

            if (event.key === "ArrowLeft") {
                showPrevious();
            }

            if (event.key === "ArrowRight") {
                showNext();
            }
        });
    }


    /* ---------- Recent Highlights ----------
       Certificates & participation highlights. Each entry points
       at a PDF in assets/certificates/; the card only renders its
       VIEW CERTIFICATE link (and stays visible) when the file is
       actually present — add the PDF, refresh, it appears.
       To add a highlight: append an entry with the exact filename. */

    /* Order is the display order (top to bottom). Each entry tells
       the story; the VIEW CERTIFICATE action appears automatically
       once its PDF (exact filename below) is dropped into
       assets/certificates/ — the story itself always shows. */

    const HIGHLIGHTS = [
        {
            title: "Kaggriculture — Autonomous Farming Agent",
            kind: "KAGGLE COMPETITION",
            year: "2026",
            context: "Kaggle · Competition Ended",
            description:
                "Took part in Kaggle's AI-agent competition — built an " +
                "autonomous agent that manages a virtual farm, deciding what " +
                "to plant, harvest and sell on every turn to maximise income " +
                "against thousands of rival agents across the leaderboard.",
            profileUrl: "https://www.kaggle.com/jayashankar369085",
            feature: true,
            file: "assets/certificates/kagriculture-2k26.pdf"
        },
        {
            title: "AssemblyAI Voice Agent Hackathon",
            kind: "HACKATHON",
            year: "2026",
            context: "lablab.ai · Online",
            description:
                "Built for AssemblyAI's month-long Voice Agent Hackathon: " +
                "InterVue AI — an AI interviewer that runs full mock " +
                "interviews by voice, asks follow-ups the way a real one " +
                "would, and scores every answer.",
            project: {
                label: "INTERVUE AI",
                url: "https://main.dhoxch7krfvdk.amplifyapp.com/"
            },
            file: "assets/certificates/assemblyai-voice-agent-hackathon.pdf"
        },
        {
            title: "WeMakeDevs × AWS Hackathon",
            kind: "HACKATHON",
            year: "2026",
            context: "Polaris School of Institution",
            description:
                "Hacked at the WeMakeDevs × AWS hackathon hosted at Polaris " +
                "School of Institution — built VeriFYI, an AI tool that " +
                "checks internship and job offers and flags the ones that " +
                "look like scams before students get hurt.",
            project: {
                label: "VERIFYI",
                url: "https://main.d1o8jaoxaet2sg.amplifyapp.com/"
            },
            file: "assets/certificates/wemakedevs-aws-hackathon.pdf"
        },
        {
            title: "SAP Certification",
            kind: "CERTIFICATION",
            year: "2026",
            context: "SAP",
            description:
                "Finished my SAP certification — enterprise software " +
                "fundamentals, core business processes, and how SAP systems " +
                "hold large operations together.",
            file: "assets/certificates/sap-certification.pdf"
        },
        {
            title: "AWS Certification",
            kind: "CERTIFICATION",
            year: "2026",
            context: "Amazon Web Services",
            description:
                "Earned my AWS certification — cloud foundations, core " +
                "services, and what it takes to deploy and run applications " +
                "on AWS infrastructure.",
            file: "assets/certificates/aws-certification.pdf"
        },
        {
            title: "Google Cloud Computing Foundations",
            kind: "CERTIFICATION",
            year: "2025",
            context: "Google Cloud",
            description:
                "Completed the GCCF program — cloud computing basics, big " +
                "data and machine learning concepts, and the core Google " +
                "Cloud services everything else builds on.",
            file: "assets/certificates/gccf-certification.pdf"
        }
    ];


    /* A certificate counts as present only when the server confirms a
       real PDF at that URL. HEAD is tried first; some static hosts
       reject HEAD (405) or answer 200 with an HTML fallback page, so a
       GET + content-type check runs before anything is hidden. A
       network-level failure (fetch unavailable, e.g. the page opened
       from file://) keeps the card — navigating to the href still
       opens the PDF in that situation. */

    function looksLikePdf(response) {

        const type =
            (response.headers.get("content-type") || "").toLowerCase();

        return type === "" ||
            type.includes("pdf") ||
            type.includes("octet-stream");
    }


    function certificateExists(url) {

        return fetch(url, { method: "HEAD" })
            .then(response => {

                if (response.ok && looksLikePdf(response)) {
                    return true;
                }

                return fetch(url)
                    .then(getResponse =>
                        getResponse.ok && looksLikePdf(getResponse))
                    .catch(() => false);
            })
            .catch(() => true);
    }


    function highlightActionsHTML(item) {

        const links = [];

        if (item.file) {

            links.push(`
                <a class="highlight-link"
                   href="${item.file}"
                   target="_blank"
                   rel="noopener noreferrer"
                   data-highlight-cert
                   data-cursor="view"
                   data-cursor-text="OPEN PDF ↗">

                    VIEW CERTIFICATE
                    <i class="bi bi-arrow-up-right"></i>

                </a>
            `);
        }

        if (item.project) {

            links.push(`
                <a class="highlight-link"
                   href="${item.project.url}"
                   target="_blank"
                   rel="noopener noreferrer"
                   data-cursor="view"
                   data-cursor-text="VISIT ↗">

                    BUILT ${item.project.label}
                    <i class="bi bi-arrow-up-right"></i>

                </a>
            `);
        }

        if (item.profileUrl) {

            links.push(`
                <a class="highlight-link"
                   href="${item.profileUrl}"
                   target="_blank"
                   rel="noopener noreferrer"
                   data-cursor="view"
                   data-cursor-text="VISIT ↗">

                    KAGGLE PROFILE
                    <i class="bi bi-arrow-up-right"></i>

                </a>
            `);
        }

        if (links.length === 0) {
            return "";
        }

        return `<div class="highlight-actions">${links.join("")}</div>`;
    }


    function renderHighlights() {

        const grid = document.getElementById("highlightsTimeline");

        const emptyNote = document.getElementById("highlightsEmpty");

        if (!grid) {
            return;
        }

        grid.innerHTML = "";

        HIGHLIGHTS.forEach(item => {

            const entry = document.createElement("article");

            entry.className = item.feature
                ? "highlight-entry highlight-feature"
                : "highlight-entry";

            entry.innerHTML = `
                <div class="highlight-when">
                    <span class="highlight-year">${item.year}</span>
                    <span class="highlight-context">${item.context}</span>
                </div>

                <span class="highlight-dot" aria-hidden="true"></span>

                <div class="highlight-body">

                    <span class="highlight-kind">${item.kind}</span>

                    <h3 class="highlight-title">${item.title}</h3>

                    <p class="highlight-desc">${item.description}</p>

                    ${highlightActionsHTML(item)}

                </div>
            `;

            grid.appendChild(entry);

            /* The VIEW CERTIFICATE action only shows once the PDF is
               actually in the folder — the story itself always shows. */

            if (item.file) {

                const certLink =
                    entry.querySelector("[data-highlight-cert]");

                certificateExists(item.file)
                    .then(exists => {

                        if (!exists && certLink) {
                            certLink.style.display = "none";
                        }
                    });
            }
        });

        if (HIGHLIGHTS.length === 0 && emptyNote) {
            emptyNote.hidden = false;
        }
    }


    /* ---------- Experience certificate links ----------
       Certificate PDFs are uploaded separately; hide any link
       whose file is not present so visitors never hit a 404.
       When a PDF is added, the link appears on next load. */

    function initExperienceCertificates() {

        const links =
            document.querySelectorAll(".experience-certificate");

        links.forEach(link => {

            certificateExists(link.getAttribute("href"))
                .then(exists => {

                    if (!exists) {
                        link.style.display = "none";
                    }
                });
        });
    }


    function init() {

        initTheme();
        initTyping();
        initAutoImages();
        initProjectFilter();
        initLightbox();
        initExperienceCertificates();
        renderHighlights();
    }


    return { init };
})();
