/* ==================================================
   EASTER EGGS
   1) Hidden terminal — open with the backtick key
      (`) or double-tap the footer logo. Commands are
      answered from real portfolio data only.
   2) Konami code — a short developer-themed glitch
      overlay, then everything returns to normal.
================================================== */

const EasterEggs = (() => {

    /* ---------- Data (mirrors the site content) ---------- */

    const PROFILE = {
        name: "Jayashankar",
        role: "Software Developer",
        education: "BE Computer Science Engineering",
        location: "Bengaluru, Karnataka",
        email: "jayashankaryt14@gmail.com",
        github: "https://github.com/Jayashankar369085",
        linkedin: "https://www.linkedin.com/in/jayashankar-p-a67315293"
    };

    const SKILLS_LIST = {
        Frontend: ["HTML", "CSS", "JavaScript", "Bootstrap 5", "React"],
        Programming: ["Java", "Python", "C", "C++", "JavaScript", "Dart"],
        "Backend & APIs": ["Node.js", "Express.js", "PHP", "FastAPI", "REST APIs"],
        "Database & Cloud": ["MySQL", "MongoDB", "Firebase", "Firestore"],
        Mobile: ["Flutter", "Dart", "Firebase Integration"],
        "AI/ML & Tools": ["Pandas", "NumPy", "Scikit-learn", "TensorFlow", "MediaPipe", "Git", "GitHub"]
    };

    const PROJECTS_LIST = [
        "MediAssist — AI-Powered Smart Medication Management (Flutter, Firebase, FastAPI) — IN PRODUCTION",
        "InterVue AI — AI Voice Interview Platform (LIVE)",
        "VeriFYI — Internship Scam Detector for Students (LIVE)",
        "Imperial Wheels — Luxury Car & Bike Rental Platform (MERN, LIVE)",
        "Bengaluru Metro Route Finder — Java Swing + DFS",
        "CruzeLab — Interactive Car Customization (PHP, MySQL)",
        "Gesture-Controlled Car Infotainment — MediaPipe Computer Vision"
    ];

    const ACHIEVEMENTS_LIST = [
        "Outstanding Student — 1st Year → 3rd Year (scholarship-linked)",
        "2nd Prize — WebXellence 2025",
        "3rd Prize — WebXellence 2024",
        "Runner-Up — JPL Cricket 2025",
        "Runner-Up — JPL Cricket 2026",
        "Consolation Prize — CSI Coding Challenge"
    ];


    /* ---------- Terminal ---------- */

    let terminalElement = null;
    let outputElement = null;
    let inputElement = null;
    let history = [];
    let historyIndex = -1;

    const BANNER = [
        "Jayashankar OS v1.0 — type `help` to begin",
        ""
    ].join("\n");


    function printLine(text, className = "") {

        const line = document.createElement("div");

        line.className = `terminal-line ${className}`;

        if (text === "") {
            line.innerHTML = "&nbsp;";
        } else {
            line.textContent = text;
        }

        outputElement.appendChild(line);
        outputElement.scrollTop = outputElement.scrollHeight;
    }


    function printHTML(html) {

        const line = document.createElement("div");

        line.className = "terminal-line";
        line.innerHTML = html;
        outputElement.appendChild(line);
        outputElement.scrollTop = outputElement.scrollHeight;
    }


    function respond(command, args) {

        switch (command) {

            case "help":
                printLine("Available commands:");
                [
                    "  whoami      — who am I",
                    "  skills      — list technical skills",
                    "  projects    — list projects",
                    "  achievements— awards and recognition",
                    "  contact     — reach out",
                    "  sudo hire   — initiate contact 🙂",
                    "  clear       — clear the terminal"
                ].forEach(printLine);
                break;


            case "whoami":
                printHTML(
                    `<span class="terminal-accent">${PROFILE.name}</span> — ` +
                    `${PROFILE.role} | ${PROFILE.education} | ${PROFILE.location}`
                );
                break;


            case "skills":
                Object.entries(SKILLS_LIST).forEach(([group, items]) => {
                    printHTML(
                        `<span class="terminal-accent">${group}:</span> ` +
                        items.join(", ")
                    );
                });
                break;


            case "projects":
                PROJECTS_LIST.forEach(project =>
                    printLine("• " + project)
                );
                break;


            case "achievements":
                ACHIEVEMENTS_LIST.forEach(achievement =>
                    printLine("✓ " + achievement)
                );
                break;


            case "contact":
                printHTML(
                    `<span class="terminal-accent">email:</span> ` +
                    `<a href="mailto:${PROFILE.email}">${PROFILE.email}</a>`
                );
                printHTML(
                    `<span class="terminal-accent">github:</span> ` +
                    `<a href="${PROFILE.github}" target="_blank" rel="noopener">${PROFILE.github}</a>`
                );
                printHTML(
                    `<span class="terminal-accent">linkedin:</span> ` +
                    `<a href="${PROFILE.linkedin}" >${PROFILE.linkedin}</a>`
                );
                break;


            case "sudo":
                if (args[0] === "hire") {

                    printLine(
                        "[sudo] password for visitor: ********",
                        "terminal-dim"
                    );
                    printLine("Access granted ✔ Initiating contact sequence...");
                    setTimeout(() => {
                        window.location.href =
                            `mailto:${PROFILE.email}?subject=Opportunity%20for%20Jayashankar`;
                    }, 900);

                } else {
                    printLine(
                        "sudo: only 'sudo hire' is supported 🙂",
                        "terminal-dim"
                    );
                }
                break;


            case "clear":
                outputElement.innerHTML = "";
                break;


            case "exit":
                closeTerminal();
                break;


            default:
                printLine(
                    `command not found: ${command} — try 'help'`,
                    "terminal-error"
                );
        }
    }


    function runCommand(raw) {

        const trimmed = raw.trim();

        printHTML(
            `<span class="terminal-prompt-symbol">➜</span> ` +
            `<span class="terminal-dim">~</span> ${escapeHTML(trimmed)}`
        );

        if (trimmed === "") {
            return;
        }

        const [command, ...args] = trimmed.split(/\s+/);

        respond(
            command.toLowerCase(),
            args.map(arg => arg.toLowerCase())
        );
    }


    function escapeHTML(text) {

        const div = document.createElement("div");

        div.textContent = text;

        return div.innerHTML;
    }


    function openTerminal() {

        if (!terminalElement) {
            return;
        }

        terminalElement.classList.add("terminal-open");
        terminalElement.setAttribute("aria-hidden", "false");

        setTimeout(() => inputElement && inputElement.focus(), 60);

        if (outputElement.childElementCount === 0) {
            printLine(BANNER);
        }
    }


    function closeTerminal() {

        if (!terminalElement) {
            return;
        }

        terminalElement.classList.remove("terminal-open");
        terminalElement.setAttribute("aria-hidden", "true");

        if (inputElement) {
            inputElement.blur();
        }
    }


    function toggleTerminal() {

        if (!terminalElement) {
            return;
        }

        if (terminalElement.classList.contains("terminal-open")) {
            closeTerminal();
        } else {
            openTerminal();
        }
    }


    /* ---------- Konami ---------- */

    const KONAMI_SEQUENCE = [
        "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
        "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
        "b", "a"
    ];

    let konamiProgress = 0;


    function triggerKonami() {

        konamiProgress = 0;

        document.body.classList.add("konami-active");

        setTimeout(
            () => document.body.classList.remove("konami-active"),
            2600
        );
    }


    /* ---------- Wiring ---------- */

    function buildTerminalDOM() {

        const terminal =
            document.getElementById("easterTerminal");

        if (!terminal) {
            return;
        }

        terminal.innerHTML = `
            <div class="terminal-window" role="dialog"
                 aria-label="Portfolio terminal">
                <div class="terminal-header">
                    <span class="terminal-dots"><span></span><span></span><span></span></span>
                    <span class="terminal-title">jayashankar@portfolio: ~</span>
                    <button type="button" class="terminal-close"
                            aria-label="Close terminal">
                        <i class="bi bi-x-lg"></i>
                    </button>
                    </div>
                <div class="terminal-output" aria-live="polite"></div>
                <div class="terminal-input-row">
                    <span class="terminal-prompt-symbol">➜</span>
                    <span class="terminal-dim">~</span>
                    <input
                        type="text"
                        class="terminal-input"
                        autocomplete="off"
                        spellcheck="false"
                        aria-label="Terminal command input"
                        placeholder="type 'help'">
                </div>
            </div>
        `;

        terminalElement = terminal;
        outputElement =
            terminal.querySelector(".terminal-output");
        inputElement =
            terminal.querySelector(".terminal-input");

        terminal.querySelector(".terminal-close")
            .addEventListener("click", closeTerminal);

        terminal.addEventListener("click", event => {

            if (event.target === terminal) {
                closeTerminal();
            }
        });


        inputElement.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {
                    runCommand(inputElement.value);
                    inputElement.value = "";
                }

                if (event.key === "ArrowUp") {

                    event.preventDefault();

                    if (history.length > 0) {

                        historyIndex =
                            Math.max(0, historyIndex - 1);

                        inputElement.value =
                            history[historyIndex] || "";
                    }
                }

                if (event.key === "ArrowDown") {

                    event.preventDefault();

                    if (history.length > 0) {

                        historyIndex =
                            Math.min(
                                history.length,
                                historyIndex + 1
                            );

                        inputElement.value =
                            history[historyIndex] || "";
                    }
                }
            }
        );

        inputElement.addEventListener("keydown", event => {

            if (event.key === "Enter" && inputElement.value.trim()) {
                history.push(inputElement.value.trim());
                historyIndex = history.length;
            }
        });
    }


    function init() {

        buildTerminalDOM();

        /* Global keyboard shortcuts. */
        document.addEventListener("keydown", event => {

            /* Ignore when the user is typing in a field.
               (Guard: synthetic/document-targeted events have
               no .matches method.) */
            const target = event.target;

            const inInput =
                target instanceof Element &&
                target.matches("input, textarea");

            if (event.key === "`" && !inInput) {
                event.preventDefault();
                toggleTerminal();
                return;
            }

            if (event.key === "Escape") {
                closeTerminal();
            }


            /* Konami. */
            if (!inInput) {

                const expected =
                    KONAMI_SEQUENCE[konamiProgress];

                /* Lowercase both sides so "ArrowUp" matches
                   "arrowup", etc. */
                const key = event.key.toLowerCase();

                if (key === expected.toLowerCase()) {

                    konamiProgress += 1;

                    if (
                        konamiProgress ===
                        KONAMI_SEQUENCE.length
                    ) {
                        triggerKonami();
                    }

                } else {

                    konamiProgress =
                        key === KONAMI_SEQUENCE[0]
                            ? 1 : 0;
                }
            }
        });


        /* Also openable via footer hint. */
        const trigger =
            document.getElementById("terminalTrigger");

        if (trigger) {
            trigger.addEventListener(
                "click",
                toggleTerminal
            );
        }
    }


    return {
        init,
        _debug: { openTerminal, closeTerminal }
    };
})();
