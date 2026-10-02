/* ==================================================
   PROJECT DETAILS
   Full-screen premium detail view. Opens from the
   project slabs; carries the real project copy that
   used to live in the Bootstrap modals.
   No images — typography, motion and glow carry it.
================================================== */

const ProjectDetails = (() => {

    /* ---------- Project data (from the former modals) ---------- */

    const PROJECTS = {
        mediassist: {
            index: "01",
            name: "MediAssist",
            subtitle: "AI-Powered Smart Medication Management System",
            status: "IN PRODUCTION",
            statusKind: "building",
            tagline: "Currently building",
            tech: ["Flutter", "Firebase", "Python", "ML"],
            fullTech: [
                "Flutter", "Dart", "Firebase", "Firestore",
                "Python", "FastAPI", "Scikit-learn",
                "Machine Learning", "REST APIs"
            ],
            overview: [
                "MediAssist is an ongoing Flutter-based healthcare application designed to combine medication management, artificial intelligence, prescription processing, medical report assistance, and doctor appointment services within a single mobile application.",
                "The system combines a Flutter frontend, Firebase services, and a Python FastAPI backend. A machine-learning symptom prediction model analyzes user-selected symptoms and returns a predicted disease, confidence score, disease description, precautions, medications, diet suggestions, and workout recommendations."
            ],
            problem:
                "Medication tracking, symptom analysis and doctor appointments usually live in separate tools and paperwork. MediAssist brings them together in one intelligent mobile application.",
            features: [
                "AI-powered symptom analysis",
                "Machine-learning disease prediction",
                "Prescription OCR processing integration",
                "Medication reminder system",
                "Medical report interpretation",
                "Doctor discovery and appointment booking",
                "Firebase authentication and Firestore storage",
                "Flutter and REST API integration"
            ],
            contributionLabel: "My Contribution",
            contribution: [
                "Leading the four-member development team",
                "Flutter application development",
                "UI/UX implementation",
                "Firebase and authentication integration",
                "Medication reminder module",
                "AI symptom analyzer development",
                "FastAPI backend integration",
                "OCR module integration",
                "System integration and final testing"
            ],
            liveUrl: null,
            githubUrl: null
        },

        intervue: {
            index: "02",
            name: "InterVue AI",
            subtitle: "AI-Powered Voice Interview Platform",
            status: "LIVE",
            statusKind: "live",
            tagline: "Deployed and running",
            tech: ["Next.js", "AI", "AssemblyAI", "AWS"],
            fullTech: ["Next.js", "AI", "Voice", "AssemblyAI", "AWS", "Web"],
            overview: [
                "InterVue AI is an AI-powered voice interview platform — practice interviews with an AI interviewer that listens, asks follow-ups, and scores your answers."
            ],
            problem:
                "Interview practice usually needs a partner or static question banks. InterVue AI replaces both with a voice-driven AI interviewer that responds and follows up like a real one.",
            features: [
                "Voice-driven mock interviews",
                "AI interviewer with follow-up questions",
                "Automated answer scoring"
            ],
            contributionLabel: "My Contribution",
            contribution: [
                "Designed and built the full platform",
                "Voice interaction and AI interview flow",
                "Deployment on AWS Amplify"
            ],
            liveUrl: "https://main.dhoxch7krfvdk.amplifyapp.com/",
            githubUrl: null
        },

        verifyi: {
            index: "03",
            name: "VeriFYI",
            subtitle: "Internship & Job Scam Detector for Students",
            status: "LIVE",
            statusKind: "live",
            tagline: "Deployed and running",
            tech: ["AI", "Web", "Student Safety"],
            fullTech: ["AI", "Web", "Student Safety"],
            overview: [
                "VeriFYI is an AI-powered platform that helps students identify whether internship and job opportunities are genuine or potentially fraudulent."
            ],
            problem:
                "Students are frequent targets of fake internship and job offers. VeriFYI gives them a fast way to check an opportunity before they commit personal data, time or money.",
            features: [
                "AI analysis of internship and job offers",
                "Genuine vs potentially fraudulent classification",
                "Built specifically for student safety"
            ],
            contributionLabel: "My Contribution",
            contribution: [
                "Designed and built the full platform",
                "AI verification flow and interface",
                "Deployment on AWS Amplify"
            ],
            liveUrl: "https://main.d1o8jaoxaet2sg.amplifyapp.com/",
            githubUrl: null
        },

        imperial: {
            index: "04",
            name: "Imperial Wheels",
            subtitle: "Luxury Car & Bike Rental Platform",
            status: "LIVE",
            statusKind: "live",
            tagline: "Deployed and running",
            tech: ["MongoDB", "Express.js", "React", "Node.js"],
            fullTech: [
                "MongoDB", "MongoDB Atlas", "Express.js", "React",
                "Node.js", "JavaScript", "REST APIs", "Nodemailer"
            ],
            overview: [
                "Imperial Wheels is a MERN-stack luxury car and bike rental platform designed to provide users with a modern vehicle discovery and booking experience while providing administrators with tools for managing vehicles and rental requests.",
                "The application combines React-based interfaces with Node.js and Express REST APIs, MongoDB Atlas for cloud database storage, and Nodemailer for booking-related email notifications."
            ],
            problem:
                "Browsing and booking luxury rentals usually means calls and paperwork. Imperial Wheels turns vehicle discovery, booking and approval into one clean online workflow.",
            features: [
                "Luxury car and motorcycle listings",
                "Detailed vehicle information pages",
                "Vehicle image galleries",
                "Rental booking workflow",
                "Administrative dashboard",
                "Booking approval and rejection",
                "Email notification system",
                "Vehicle management operations",
                "MongoDB Atlas integration"
            ],
            contributionLabel: "Technical Implementation",
            contribution: [
                "React component-based architecture",
                "Responsive user interfaces",
                "Node.js and Express backend",
                "RESTful API communication",
                "MongoDB database models",
                "Cloud-hosted MongoDB Atlas storage",
                "Nodemailer email notifications",
                "Administrative booking workflows"
            ],
            liveUrl: "http://imperial-wheels-henna.vercel.app/",
            githubUrl: "https://github.com/Jayashankar369085/imperial-wheels"
        },

        metro: {
            index: "05",
            name: "Bengaluru Metro Route Finder",
            subtitle: "Graph-Based Metro Route Discovery Application",
            status: "COMPLETED",
            statusKind: "done",
            tagline: "Java desktop application",
            tech: ["Java", "Java Swing", "DFS", "Graphs"],
            fullTech: ["Java", "Java Swing", "Graphs", "DFS", "HashMap", "Recursion"],
            overview: [
                "Bengaluru Metro Route Finder is a Java Swing desktop application that models metro stations and their connections using graph-based data structures.",
                "The application uses Depth First Search with recursion and backtracking to discover routes between source and destination stations. It displays route information, station count, interchange count, and calculated fares through an interactive Java Swing interface."
            ],
            problem:
                "Finding a valid route, interchange count and fare across a metro network is a classic graph problem — this application solves it interactively for the Bengaluru Metro.",
            features: [
                "Source and destination station selection",
                "Graph-based metro network representation",
                "DFS route discovery",
                "Recursive backtracking",
                "Route display through Java Swing GUI",
                "Station counting",
                "Interchange detection and counting",
                "Fare calculation"
            ],
            contributionLabel: "Technical Concepts",
            contribution: [
                "Java Collections Framework",
                "HashMap-based graph representation",
                "Adjacency relationships",
                "Depth First Search",
                "Recursion",
                "Backtracking",
                "Java Swing GUI development",
                "Event-driven programming"
            ],
            liveUrl: null,
            githubUrl: null
        },

        cruzelab: {
            index: "06",
            name: "CruzeLab",
            subtitle: "Interactive Car Customization Platform",
            status: "COMPLETED",
            statusKind: "done",
            tagline: "Web application",
            tech: ["HTML", "CSS", "JavaScript", "PHP", "MySQL"],
            fullTech: ["HTML5", "CSS3", "JavaScript", "Bootstrap 5", "PHP", "MySQL", "XAMPP"],
            overview: [
                "CruzeLab is an interactive web application centered on vehicle exploration and customization through a responsive user interface.",
                "The project combines HTML, CSS, Bootstrap, and JavaScript interfaces with PHP backend functionality and MySQL database integration through XAMPP."
            ],
            problem:
                "Exploring and customizing vehicles online is usually a static catalogue experience — CruzeLab makes it an interactive, responsive workflow backed by a real database.",
            features: [
                "Vehicle exploration interface",
                "Interactive car customization workflows",
                "Responsive web layouts",
                "Interactive frontend components",
                "PHP backend functionality",
                "MySQL database integration"
            ],
            contributionLabel: "Technology Stack",
            contribution: [
                "HTML5",
                "CSS3",
                "JavaScript",
                "Bootstrap 5",
                "PHP",
                "MySQL",
                "XAMPP"
            ],
            liveUrl: null,
            githubUrl: "https://github.com/Jayashankar369085/cruzelab"
        },

        gesture: {
            index: "07",
            name: "Gesture-Controlled Car Infotainment",
            subtitle: "Touch-Free Vehicle Interface Prototype",
            status: "PROTOTYPE",
            statusKind: "done",
            tagline: "Computer vision prototype",
            tech: ["Python", "MediaPipe", "Computer Vision", "JavaScript"],
            fullTech: ["Python", "MediaPipe", "Computer Vision", "Hand Landmark Detection", "JavaScript", "Web Interface"],
            overview: [
                "Gesture-Controlled Car Infotainment is a computer vision prototype designed to explore touch-free interaction with automotive infotainment systems.",
                "The system uses Python and MediaPipe to perform real-time hand landmark detection and gesture recognition. These gestures are mapped to controls for music, navigation, communication, and other dashboard interactions."
            ],
            problem:
                "Touching dashboard controls while driving splits attention — this prototype explores controlling music, navigation and communication touch-free with hand gestures.",
            features: [
                "Real-time hand tracking",
                "Gesture recognition",
                "Touch-free interface interaction",
                "Music controls",
                "Navigation interface controls",
                "Communication controls"
            ],
            contributionLabel: "Technology Stack",
            contribution: [
                "Python",
                "MediaPipe",
                "Computer Vision",
                "Hand Landmark Detection",
                "JavaScript",
                "Web Interface Development"
            ],
            liveUrl: null,
            githubUrl: "https://github.com/Jayashankar369085/Gesture_App"
        }
    };

    const PROJECT_ORDER =
        ["mediassist", "intervue", "verifyi", "imperial", "metro", "cruzelab", "gesture"];

    let overlay = null;
    let currentId = null;
    let isOpen = false;


    /* ---------- Markup helpers ---------- */

    function listHTML(items) {
        return items.map(item => `<li>${item}</li>`).join("");
    }

    function tagsHTML(items) {
        return items.map((item, i) =>
            `<span class="detail-tag" style="transition-delay:${80 + i * 45}ms">${item}</span>`
        ).join("");
    }

    function linksHTML(project) {
        const links = [];

        if (project.liveUrl) {
            links.push(
                `<a class="detail-cta detail-cta-live" href="${project.liveUrl}" ` +
                `target="_blank" rel="noopener noreferrer">` +
                `LIVE PROJECT <i class="bi bi-arrow-up-right"></i></a>`
            );
        }

        if (project.githubUrl) {
            links.push(
                `<a class="detail-cta detail-cta-github" href="${project.githubUrl}" ` +
                `target="_blank" rel="noopener noreferrer">` +
                `<i class="bi bi-github"></i> GITHUB REPO <i class="bi bi-arrow-up-right"></i></a>`
            );
        }

        if (links.length === 0) {
            return "";
        }

        return `
            <div class="detail-section detail-links">
                <h4 class="detail-heading">EXPLORE</h4>
                <div class="detail-links-row">${links.join("")}</div>
            </div>
        `;
    }


    /* ---------- Build the overlay ---------- */

    function buildOverlay() {

        overlay = document.createElement("div");
        overlay.id = "projectDetailOverlay";
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");
        overlay.setAttribute("aria-hidden", "true");

        overlay.innerHTML = `
            <div class="detail-backdrop" data-detail-close></div>
            <div class="detail-panel">
                <div class="detail-chrome">
                    <button type="button" class="detail-back" data-detail-close>
                        <i class="bi bi-arrow-left"></i>
                        BACK TO PROJECTS
                    </button>
                    <button type="button" class="detail-close" data-detail-close
                            aria-label="Close project details">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                <div class="detail-scroll">
                    <div class="detail-body"></div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.addEventListener("click", event => {
            if (event.target.closest("[data-detail-close]")) {
                close();
            }
        });
    }


    function render(project) {

        const nextId =
            PROJECT_ORDER[(PROJECT_ORDER.indexOf(currentId) + 1) % PROJECT_ORDER.length];
        const nextProject = PROJECTS[nextId];

        overlay.querySelector(".detail-body").innerHTML = `
            <header class="detail-header">
                <span class="detail-eyebrow">PROJECT ${project.index} / 07</span>
                <h2 class="detail-title">${project.name}</h2>
                <p class="detail-subtitle">${project.subtitle}</p>
                <div class="detail-status-row">
                    <span class="detail-status detail-status-${project.statusKind}">
                        ${project.statusKind === "live"
                            ? '<span class="live-dot"></span>'
                            : ""}${project.status}
                    </span>
                    <span class="detail-status-note">${project.tagline}</span>
                </div>
            </header>

            <div class="detail-section">
                <h4 class="detail-heading">OVERVIEW</h4>
                ${project.overview.map(p => `<p class="detail-text">${p}</p>`).join("")}
            </div>

            <div class="detail-section">
                <h4 class="detail-heading">PROBLEM IT SOLVES</h4>
                <p class="detail-text">${project.problem}</p>
            </div>

            <div class="detail-section">
                <h4 class="detail-heading">KEY FEATURES</h4>
                <ul class="detail-features">${listHTML(project.features)}</ul>
            </div>

            <div class="detail-section">
                <h4 class="detail-heading">TECH STACK</h4>
                <div class="detail-tags">${tagsHTML(project.fullTech)}</div>
            </div>

            <div class="detail-section">
                <h4 class="detail-heading">${project.contributionLabel.toUpperCase()}</h4>
                <ul class="detail-features detail-features-two">${listHTML(project.contribution)}</ul>
            </div>

            <div class="detail-section">
                <h4 class="detail-heading">STATUS</h4>
                <p class="detail-text">
                    <span class="detail-status detail-status-${project.statusKind}">
                        ${project.statusKind === "live"
                            ? '<span class="live-dot"></span>'
                            : ""}${project.status}
                    </span>
                </p>
            </div>

            ${linksHTML(project)}

            <footer class="detail-footer">
                <button type="button" class="detail-next" data-detail-next>
                    NEXT PROJECT
                    <span class="detail-next-name">${nextProject.name}</span>
                    <i class="bi bi-arrow-right"></i>
                </button>
            </footer>
        `;

        const nextButton = overlay.querySelector("[data-detail-next]");

        if (nextButton) {
            nextButton.addEventListener("click", () => {
                open(nextId);
            });
        }
    }


    /* ---------- Open / close ---------- */

    function open(id) {

        const project = PROJECTS[id];

        if (!project) {
            return;
        }

        if (!overlay) {
            buildOverlay();
        }

        currentId = id;
        render(project);

        if (!isOpen) {

            overlay.classList.add("detail-open");
            overlay.setAttribute("aria-hidden", "false");
            document.body.classList.add("detail-view-open");

            isOpen = true;

            /* Force-finish safety: if transitions are throttled
               (webview), never leave the panel half-hidden. */
            setTimeout(() => {
                if (isOpen) {
                    overlay.classList.add("detail-settled");
                }
            }, 700);

            const closeBtn = overlay.querySelector(".detail-close");

            if (closeBtn) {
                setTimeout(() => closeBtn.focus(), 120);
            }
        }

        overlay.querySelector(".detail-scroll").scrollTop = 0;
    }


    function close() {

        if (!overlay || !isOpen) {
            return;
        }

        isOpen = false;

        overlay.classList.remove("detail-open", "detail-settled");
        overlay.setAttribute("aria-hidden", "true");
        document.body.classList.remove("detail-view-open");
    }


    document.addEventListener("keydown", event => {

        if (event.key === "Escape" && isOpen) {
            close();
        }
    });


    /* ---------- Open triggers (delegated on the slabs) ---------- */

    function initTriggers() {

        document.addEventListener("click", event => {

            const trigger = event.target.closest("[data-project-open]");

            if (!trigger) {
                return;
            }

            const id = trigger.dataset.projectOpen;

            if (id && PROJECTS[id]) {
                event.preventDefault();
                open(id);
            }
        });
    }


    function init() {

        buildOverlay();
        initTriggers();
    }


    return { init, open, close };
})();
