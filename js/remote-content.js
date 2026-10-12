/* ==================================================
   REMOTE CONTENT SYNC
   Applies Supabase content to the public site once
   PortfolioData resolves. Every section re-render is
   independent and wrapped in try/catch: one failing
   section never stops the others, and when Supabase is
   unavailable the static markup stays exactly as-is.

   Markup mirrors the static sections 1:1, so cursor,
   tilt, reveal, filters and detail overlay keep working.
================================================== */

const RemoteContent = (() => {

    const MONTHS_FULL = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];


    /* ---------- Helpers ---------- */

    function esc(value) {

        if (value === null || value === undefined) {
            return "";
        }

        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#39;"
        })[character]);
    }


    function dateParts(dateString) {

        if (!dateString) {
            return null;
        }

        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);

        if (!match) {
            return null;
        }

        return {
            year: parseInt(match[1], 10),
            month: parseInt(match[2], 10),
            day: parseInt(match[3], 10)
        };
    }


    /* "30 August 2026" / "August 2026" / "2026" */
    function longDate(dateString, precision) {

        const parts = dateParts(dateString);

        if (!parts) {
            return "";
        }

        if (precision === "year" || !precision) {
            return String(parts.year);
        }

        if (precision === "month") {
            return `${MONTHS_FULL[parts.month - 1]} ${parts.year}`;
        }

        return `${parts.day} ${MONTHS_FULL[parts.month - 1]} ${parts.year}`;
    }


    /* Highlights show the year in the timeline column. */
    function yearLabel(dateString) {

        const parts = dateParts(dateString);

        return parts ? String(parts.year) : "";
    }


    function section(name, fallbackMessage) {

        return {
            name,
            message: fallbackMessage
        };
    }


    /* ---------- Projects ---------- */

    function statusHTML(project) {

        const kind = project.status_kind || "done";

        if (kind === "live") {
            return `<span class="slab-status slab-status-live">
                        <span class="live-dot"></span>
                        ${esc(project.status)}
                    </span>`;
        }

        if (kind === "building") {
            return `<span class="slab-status slab-status-building">
                        <span class="slab-status-dot"></span>
                        ${esc(project.status)}
                    </span>`;
        }

        return `<span class="slab-status slab-status-done">
                    ${esc(project.status)}
                </span>`;
    }


    function renderProjects(rows) {

        const container = document.querySelector(".project-slabs");

        if (!container) {
            return;
        }

        if (rows.length === 0) {
            container.innerHTML =
                `<p class="section-lead">No published projects right now.</p>`;
            return;
        }

        container.innerHTML = rows.map((project, index) => `
            <article
                class="project-slab${project.featured ? " slab-emphasis" : ""}"
                data-project="${esc(project.slug)}"
                data-project-open="${esc(project.slug)}"
                data-reveal
                data-reveal-delay="${index * 60}">

                <span class="slab-index" aria-hidden="true">
                    ${String(index + 1).padStart(2, "0")}
                </span>

                <div class="slab-main">

                    <div class="slab-title-row">

                        <h3 class="slab-name">${esc(project.name)}</h3>

                        ${statusHTML(project)}

                    </div>

                    <p class="slab-subtitle">${esc(project.subtitle)}</p>

                    <div class="slab-tech">
                        ${(project.tech || [])
                            .map(tag => `<span>${esc(tag)}</span>`)
                            .join("")}
                    </div>

                </div>

                <div class="slab-side">

                    <span class="slab-open">
                        VIEW DETAILS
                        <i class="bi bi-arrow-right"></i>
                    </span>

                </div>

            </article>
        `).join("");
    }


    /* ---------- Experience ---------- */

    function renderExperiences(rows) {

        const container = document.querySelector(".experience-timeline");

        if (!container) {
            return;
        }

        if (rows.length === 0) {
            container.innerHTML =
                `<p class="section-lead">No published experiences right now.</p>`;
            return;
        }

        container.innerHTML = rows.map((entry, index) => {

            const certificate =
                PortfolioData.fileUrl(entry.certificate_path);

            const certificateHTML = certificate ? `
                <a class="experience-certificate"
                   href="${esc(certificate)}"
                   target="_blank"
                   rel="noopener noreferrer"
                   data-cursor="view"
                   data-cursor-text="OPEN PDF ↗">

                    VIEW CERTIFICATE
                    <i class="bi bi-arrow-up-right"></i>

                </a>
            ` : "";

            return `
                <div class="experience-entry"
                     data-reveal
                     data-reveal-delay="${index * 120}">

                    <div class="experience-node" aria-hidden="true">
                        <span></span>
                    </div>

                    <article class="experience-card">

                        <div class="experience-meta">

                            <span class="experience-date">
                                <i class="bi bi-calendar3"></i>
                                ${esc(longDate(entry.occurred_on, entry.date_precision))}
                            </span>

                            <span class="experience-type">
                                ${esc(entry.experience_type)}
                            </span>

                        </div>

                        <h3 class="experience-org">
                            ${esc(entry.organization)}
                            ${entry.title
                                ? `<span class="experience-team">— ${esc(entry.title)}</span>`
                                : ""}
                        </h3>

                        <p class="experience-description">
                            ${esc(entry.description)}
                        </p>

                        ${certificateHTML}

                    </article>

                </div>
            `;
        }).join("");
    }


    /* ---------- Achievements ---------- */

    function renderAchievements(rows) {

        const container = document.querySelector(".achievement-milestones");

        if (!container) {
            return;
        }

        if (rows.length === 0) {
            container.innerHTML =
                `<p class="section-lead">No published achievements right now.</p>`;
            return;
        }

        container.innerHTML = rows.map((item, index) => `
            <article class="milestone${item.featured ? " milestone-feature" : ""}"
                     data-reveal
                     data-reveal-delay="${(index % 3) * 80}">

                <span class="milestone-number" aria-hidden="true">
                    ${String(index + 1).padStart(2, "0")}
                </span>

                <div class="milestone-head">

                    <span class="milestone-range">
                        <i class="bi bi-calendar3"></i>
                        ${esc(item.range_label)}
                    </span>

                    ${item.tag ? `
                        <span class="milestone-tag">
                            <i class="bi bi-mortarboard"></i>
                            ${esc(item.tag)}
                        </span>
                    ` : ""}

                </div>

                <h3 class="milestone-title">${esc(item.title)}</h3>

                <p class="milestone-text">${esc(item.description)}</p>

            </article>
        `).join("");
    }


    /* ---------- Social links + site settings ---------- */

    function hostOf(url) {

        try {
            return new URL(url, window.location.href)
                .hostname.replace(/^www\./, "");
        } catch (error) {
            return null;
        }
    }


    function applySocialLinks(rows) {

        rows.forEach(link => {

            if (!link.url) {
                return;

            }

            const host = hostOf(link.url);
            const label = link.label || link.platform;

            /* Hero + footer icons carry aria-labels. */
            document.querySelectorAll(`a[aria-label="${label}"]`)
                .forEach(anchor => {
                    anchor.href = link.url;
                });

            if (!host) {
                return;
            }

            /* Contact cards + coding profile cards. */
            const containers = document.querySelectorAll(
                ".contact-links, .code-profile-card, .social-links, .footer-social"
            );

            containers.forEach(container => {

                container.querySelectorAll("a[href]").forEach(anchor => {

                    const anchorHost = hostOf(anchor.href);

                    if (anchorHost === host) {
                        anchor.href = link.url;
                    }
                });
            });
        });
    }


    function applySettings(settings) {

        const email = settings.contact_email;
        const phone = settings.contact_phone;
        const resume = settings.resume_url;

        if (email) {

            document.querySelectorAll("a[href^=\"mailto:\"]")
                .forEach(anchor => {
                    anchor.href = `mailto:${email}`;
                });

            const chip = document.getElementById("copyEmailText");

            if (chip) {
                chip.textContent = email;
            }

            document.querySelectorAll(".contact-links a[href^=\"mailto:\"] strong")
                .forEach(element => {
                    element.textContent = email;
                });
        }

        if (phone) {

            const digits = String(phone).replace(/[^\d+]/g, "");
            const href = digits.startsWith("+") ? `tel:${digits}` : `tel:+${digits}`;

            document.querySelectorAll("a[href^=\"tel:\"]")
                .forEach(anchor => {

                    anchor.href = href;

                    const label = anchor.querySelector("strong");

                    if (label) {
                        label.textContent = phone;
                    }
                });
        }

        if (resume) {

            document.querySelectorAll(".hero-buttons a")
                .forEach(anchor => {

                    if ((anchor.getAttribute("href") || "").includes("resume")) {
                        anchor.href = resume;
                    }
                });
        }
    }


    /* ---------- Apply everything ---------- */

    function apply(name, rows) {

        const renderers = {
            projects: renderProjects,
            experiences: renderExperiences,
            achievements: renderAchievements
        };

        try {

            if (name === "highlights" && window.Content &&
                typeof Content.renderHighlights === "function") {

                Content.renderHighlights(rows.map(mapHighlight));
                return;
            }

            if (name === "skills" && window.Skills &&
                typeof Skills.setData === "function") {

                Skills.setData(rows);
                return;
            }

            if (renderers[name]) {
                renderers[name](rows);
            }

        } catch (error) {
            console.warn(`Content sync skipped for "${name}":`, error);
        }
    }


    function mapHighlight(item) {

        return {
            title: item.title,
            kind: item.kind,
            year: yearLabel(item.occurred_on),
            context: item.issuer,
            description: item.description,
            feature: Boolean(item.feature),
            file: PortfolioData.fileUrl(item.certificate_path),
            profileUrl: item.profile_url || null,
            project: item.project_url
                ? {
                    label: item.project_label || "PROJECT",
                    url: item.project_url
                }
                : null
        };
    }


    function refreshReveal() {

        try {
            if (window.Reveal && typeof Reveal.refresh === "function") {
                Reveal.refresh();
            }
        } catch (error) {
            /* Reveal is cosmetic — never block content. */
        }
    }


    async function init() {

        document.documentElement.dataset.contentSync = "pending";

        const result = await PortfolioData.init();

        if (!result.ok) {

            document.documentElement.dataset.contentSync = "static";

            if (result.reason === "not-configured") {
                console.info(
                    "Supabase is not configured yet — showing the static site. " +
                    "Paste your publishable key into js/config.js (see SETUP.md)."
                );
            } else {
                console.warn("Supabase content sync failed — keeping static content.", result.error);
            }

            return;
        }

        const sections = result.sections || {};

        /* Every table carries its own ok flag: a missing table only
           keeps that section static. */
        Object.keys(sections).forEach(name => {

            const sectionData = sections[name];

            if (!sectionData.ok) {
                console.warn(`Sync skipped for "${name}":`, sectionData.error);
                return;
            }

            if (name === "site_settings") {
                try {
                    applySettings(sectionData.rows);
                } catch (error) {
                    console.warn("Settings sync skipped:", error);
                }
                return;
            }

            apply(name, sectionData.rows);
        });

        /* Projects also drive the full-screen detail overlay. */
        if (sections.projects && sections.projects.ok &&
            window.ProjectDetails &&
            typeof ProjectDetails.setData === "function") {

            try {
                ProjectDetails.setData(sections.projects.rows);
            } catch (error) {
                console.warn("Project details sync skipped:", error);
            }
        }

        /* Social rows, then settings (contact email/phone win). */
        if (sections.social_links && sections.social_links.ok) {
            try {
                applySocialLinks(sections.social_links.rows);
            } catch (error) {
                console.warn("Social link sync skipped:", error);
            }
        }

        document.documentElement.dataset.contentSync = "remote";

        refreshReveal();
    }


    return { init };

})();
