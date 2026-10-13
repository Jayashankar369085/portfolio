/* ==================================================
   SKILLS — INTERACTIVE VISUALIZATION
   Category pills + interactive tag grid.
   Hovering a skill highlights skills from the same
   category; cards keep a restrained 3D feel.
   Data comes 1:1 from the original static section.
================================================== */

const Skills = (() => {

    /* Source of truth — mirrors the original markup exactly. */
    const SKILL_CATEGORIES = [
        {
            id: "frontend",
            label: "Frontend",
            icon: "bi-window",
            skills: [
                "HTML", "CSS", "JavaScript",
                "Bootstrap 5", "React", "Responsive Design"
            ]
        },
        {
            id: "languages",
            label: "Programming",
            icon: "bi-code-square",
            skills: [
                "Java", "Python", "C", "C++",
                "JavaScript", "Dart"
            ]
        },
        {
            id: "backend",
            label: "Backend & APIs",
            icon: "bi-server",
            skills: [
                "Node.js", "Express.js", "PHP",
                "FastAPI", "REST APIs"
            ]
        },
        {
            id: "database",
            label: "Database & Cloud",
            icon: "bi-database",
            skills: [
                "MySQL", "MongoDB", "MongoDB Atlas",
                "Firebase", "Firestore"
            ]
        },
        {
            id: "mobile",
            label: "Mobile",
            icon: "bi-phone",
            skills: [
                "Flutter", "Dart", "Firebase Integration",
                "REST API Integration"
]
        },
        {
            id: "ai-tools",
            label: "AI/ML & Tools",
            icon: "bi-cpu",
            skills: [
                "Pandas", "NumPy", "Scikit-learn",
                "TensorFlow", "MediaPipe", "Git", "GitHub"
            ]
        }
    ];


    function renderFilterBar(container) {

        const allButton = document.createElement("button");

        allButton.className = "filter-btn skills-filter-btn active";
        allButton.type = "button";
        allButton.textContent = "All Skills";
        allButton.dataset.skillsFilter = "all";

        container.appendChild(allButton);

        SKILL_CATEGORIES.forEach(category => {

            const button = document.createElement("button");

            button.className = "filter-btn skills-filter-btn";
            button.type = "button";
            button.textContent = category.label;
            button.dataset.skillsFilter = category.id;

            container.appendChild(button);
        });
    }


    function renderCards(container) {

        SKILL_CATEGORIES.forEach((category, index) => {

            const column = document.createElement("div");

            column.className = "col-md-6 col-lg-4";
            column.dataset.category = category.id;

            column.setAttribute("data-reveal", "");
            column.setAttribute(
                "data-reveal-delay", String(index * 70)
            );


            const card = document.createElement("article");

            card.className = "skill-card";
            card.dataset.category = category.id;


            const icon = document.createElement("div");

            icon.className = "skill-icon";
            icon.innerHTML = `<i class="bi ${category.icon}"></i>`;


            const title = document.createElement("h3");

            title.textContent = category.label;


            const tags = document.createElement("div");

            tags.className = "skill-tags";

            category.skills.forEach(skill => {

                const span = document.createElement("span");

                span.className = "skill-tag";

                span.textContent = skill;

                tags.appendChild(span);
            });


            card.appendChild(icon);
            card.appendChild(title);
            card.appendChild(tags);
            column.appendChild(card);
            container.appendChild(column);
        });
    }


    function initFiltering(rows) {

        const buttons =
            document.querySelectorAll(".skills-filter-btn");

        buttons.forEach(button => {

            button.addEventListener("click", () => {

                buttons.forEach(item =>
                    item.classList.remove("active")
                );

                button.classList.add("active");

                const filter =
                    button.dataset.skillsFilter;

                rows.forEach(row => {

                    const matches =
                        filter === "all" ||
                        row.dataset.category === filter;

                    row.classList.toggle(
                        "skills-hidden", !matches
                    );

                    if (matches) {
                        /* Re-trigger the entrance stagger. */
                        row.classList.remove("reveal-visible");
                        void row.offsetWidth; /* reflow */
                        row.classList.add("reveal-visible");
                    }
                });
            });
        });
    }


    /* Hovering one card dims the others slightly and highlights
       shared technologies — keeps focus, stays clean. */
    function initHoverFocus(cards) {

        if (MotionUtils.prefersReducedMotion) {
            return;
        }

        cards.forEach(card => {

            card.addEventListener(
                "mouseenter",
                () => cards.forEach(other =>
                    other.classList.toggle(
                        "skills-dimmed", other !== card
                    )
                )
            );

            card.addEventListener(
                "mouseleave",
                () => cards.forEach(other =>
                    other.classList.remove("skills-dimmed")
                )
            );
        });
    }


    /* ---------- Remote content ----------
       Supabase rows replace the built-in categories while
       keeping the exact same cards, filters and hover fx. */

    let boundFilterButtons = [];
    let boundCards = [];

    function setData(rows) {

        if (!Array.isArray(rows) || rows.length === 0) {
            return;
        }

        const grid = document.getElementById("skillsGrid");
        const filterBar = document.getElementById("skillsFilterBar");

        if (!grid || !filterBar) {
            return;
        }

        /* Group rows by category, preserving display order. */
        const categories = [];
        const indexByLabel = {};

        rows.forEach(row => {

            const label = row.category || "General";

            if (!(label in indexByLabel)) {
                indexByLabel[label] = categories.length;
                categories.push({
                    id: label.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                                 .replace(/^-|-$/g, "") || "general",
                    label,
                    icon: row.category_icon || "bi-code-square",
                    skills: []
                });
            }

            categories[indexByLabel[label]].skills.push({
                name: row.name,
                featured: Boolean(row.featured)
            });
        });

        /* Featured skills pin to the top of their card — a stable
           partition, so everything else keeps its sort_order — and
           carry a ★ so the admin toggle is visible on the site. */
        categories.forEach(category => {

            category.skills.sort((a, b) =>
                Number(b.featured) - Number(a.featured));

            category.skills = category.skills.map(skill =>
                skill.featured
                    ? `${skill.name} ★`
                    : skill.name
            );
        });

        SKILL_CATEGORIES.length = 0;
        categories.forEach(category => SKILL_CATEGORIES.push(category));

        grid.innerHTML = "";
        filterBar.innerHTML = "";

        renderFilterBar(filterBar);
        renderCards(grid);

        const newRows =
            Array.from(grid.querySelectorAll(".col-md-6, .col-lg-4"));

        const newCards =
            Array.from(grid.querySelectorAll(".skill-card"));

        /* Old nodes were removed with innerHTML — bind fresh ones. */
        boundFilterButtons = [];
        boundCards = [];

        initFiltering(newRows);
        initHoverFocus(newCards);

        newRows.forEach(row => row.classList.add("reveal-visible"));
    }


    function init() {

        const grid =
            document.getElementById("skillsGrid");

        const filterBar =
            document.getElementById("skillsFilterBar");

        if (!grid || !filterBar) {
            return;
        }

        renderFilterBar(filterBar);
        renderCards(grid);

        const rows =
            Array.from(grid.querySelectorAll(".col-md-6, .col-lg-4"));

        const cards =
            Array.from(grid.querySelectorAll(".skill-card"));

        boundFilterButtons =
            Array.from(document.querySelectorAll(".skills-filter-btn"));
        boundCards = cards;

        initFiltering(rows);
        initHoverFocus(cards);
    }


    return { init, setData };
})();
