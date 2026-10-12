/* ==================================================
   PORTFOLIO ADMIN — dashboard logic
   Supabase Auth + PostgREST + Storage, all from the
   browser. Security is enforced by Row Level Security
   (see supabase/migrations): the UI is a convenience,
   every write is rejected server-side for non-admins.
================================================== */

(function () {

    "use strict";

    /* ---------- Config ---------- */

    const env = window.SITE_ENV || {};

    const PUBLIC_BUCKET = "certificates-public";
    const PRIVATE_BUCKET = "certificates-private";
    const MAX_PDF_BYTES = 25 * 1024 * 1024;

    function isConfigured() {
        return Boolean(
            env.SUPABASE_URL &&
            env.SUPABASE_ANON_KEY &&
            !/^PASTE_/i.test(env.SUPABASE_ANON_KEY)
        );
    }

    let supabase = null;

    if (isConfigured() &&
        window.supabase &&
        typeof window.supabase.createClient === "function") {

        supabase = window.supabase.createClient(
            env.SUPABASE_URL,
            env.SUPABASE_ANON_KEY,
            { auth: { persistSession: true, autoRefreshToken: true } }
        );
    }


    /* ---------- DOM helpers ---------- */

    const $ = (selector, root) => (root || document).querySelector(selector);
    const $$ = (selector, root) =>
        Array.from((root || document).querySelectorAll(selector));

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


    function lines(value) {

        if (Array.isArray(value)) {
            return value.join("\n");
        }

        return value ? String(value) : "";
    }


    /* ---------- Toasts ---------- */

    function toast(message, kind) {

        const root = $("#toastRoot");

        if (!root) {
            (kind === "error" ? console.error : console.log)(message);
            return;
        }

        const node = document.createElement("div");

        node.className = "toast " + (kind || "success");

        const icon =
            kind === "error" ? "bi-exclamation-circle-fill" :
            kind === "info" ? "bi-info-circle-fill" :
            "bi-check-circle-fill";

        node.innerHTML =
            `<i class="bi ${icon}"></i><span>${esc(message)}</span>`;

        root.appendChild(node);

        setTimeout(() => {
            node.style.opacity = "0";
            node.style.transition = "opacity .3s ease";
            setTimeout(() => node.remove(), 320);
        }, 3600);
    }


    /* ---------- Modal ---------- */

    function openModal(options) {

        const root = $("#modalRoot");

        root.innerHTML =
            `<div class="modal-card${options.wide ? " wide" : ""}">
                <div class="modal-head">
                    <h3>${esc(options.title)}</h3>
                    <button type="button" class="modal-close" aria-label="Close">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                <div class="modal-body"></div>
                <div class="modal-foot"></div>
            </div>`;

        root.hidden = false;
        document.body.style.overflow = "hidden";

        const body = $(".modal-body", root);
        const foot = $(".modal-foot", root);

        if (typeof options.body === "string") {
            body.innerHTML = options.body;
        } else if (options.body) {
            body.appendChild(options.body);
        }

        const actions = options.actions || [];

        if (actions.length === 0) {
            foot.remove();
        }

        let closed = false;

        function close() {

            if (closed) {
                return;
            }

            closed = true;
            root.hidden = true;
            root.innerHTML = "";
            document.body.style.overflow = "";

            document.removeEventListener("keydown", onKey);
            root.removeEventListener("click", onBackdrop);

            if (options.onClose) {
                options.onClose();
            }
        }

        function onKey(event) {
            if (event.key === "Escape") {
                close();
            }
        }

        function onBackdrop(event) {
            if (event.target === root) {
                close();
            }
        }

        $(".modal-close", root).addEventListener("click", close);
        root.addEventListener("click", onBackdrop);
        document.addEventListener("keydown", onKey);

        actions.forEach(action => {

            const button = document.createElement("button");

            button.type = "button";
            button.className = action.className || "btn-ghost";
            button.innerHTML = action.label;

            if (action.disabled) {
                button.disabled = true;
            }

            button.addEventListener("click", () => action.onClick(close));
            foot.appendChild(button);
        });

        if (options.onMount) {
            options.onMount(body, close);
        }

        return close;
    }


    function confirmDialog(options) {

        return new Promise(resolve => {

            let settled = false;

            const finish = value => {
                if (!settled) {
                    settled = true;
                    resolve(value);
                }
            };

            openModal({
                title: options.title,
                body: `<p style="color:var(--muted);margin:0;">
                           ${esc(options.message)}
                       </p>`,
                actions: [
                    {
                        label: "Cancel",
                        className: "btn-ghost",
                        onClick: close => {
                            finish(false);
                            close();
                        }
                    },
                    {
                        label: options.confirmLabel || "Delete",
                        className: options.danger === false
                            ? "btn-primary" : "btn-danger",
                        onClick: close => {
                            /* Resolve first: close() fires onClose, which
                               would otherwise settle the promise as false. */
                            finish(true);
                            close();
                        }
                    }
                ],
                onClose: () => finish(false)
            });
        });
    }


    /* ==================================================
       ENTITY DEFINITIONS
    ================================================== */

    const FILE_HINT =
        "PDF only, max 25 MB. Files are stored in Supabase Storage " +
        "(private until published).";

    const ENTITIES = {

        projects: {
            table: "projects",
            title: "Projects",
            singular: "Project",
            addLabel: "Add project",
            subtitle:
                "Text slabs on the home page. Clicking a slab opens the " +
                "detail view; empty URLs hide that button.",
            defaults: {
                slug: "", name: "", subtitle: "",
                status: "COMPLETED", status_kind: "done", tagline: "",
                overview: [], problem: "", features: [],
                tech: [], full_tech: [],
                contribution_label: "My Contribution", contribution: [],
                live_url: null, github_url: null,
                featured: false, is_published: true
            },
            fields: [
                { key: "name", label: "Name", type: "text", required: true },
                { key: "slug", label: "Slug", type: "text", required: true,
                  hint: "Lowercase id used by the detail view, e.g. mediassist" },
                { key: "subtitle", label: "Short description", type: "text",
                  hint: "Shown under the name on the slab" },
                { key: "status", label: "Status label", type: "text",
                  placeholder: "LIVE / IN PRODUCTION / COMPLETED" },
                { key: "status_kind", label: "Status style", type: "select",
                  options: [
                    ["live", "Live (green dot)"],
                    ["building", "Building (purple dot)"],
                    ["done", "Completed (plain)"]
                  ] },
                { key: "tagline", label: "Status note", type: "text",
                  placeholder: "Deployed and running" },
                { key: "overview", label: "Full overview",
                  type: "lines", rows: 6,
                  hint: "One paragraph per line" },
                { key: "problem", label: "Problem it solves",
                  type: "textarea" },
                { key: "features", label: "Key features", type: "lines",
                  hint: "One per line" },
                { key: "tech", label: "Technologies on the slab",
                  type: "lines", hint: "One per line" },
                { key: "full_tech", label: "Tech stack in the details",
                  type: "lines", hint: "One per line" },
                { key: "contribution_label", label: "Contribution heading",
                  type: "text" },
                { key: "contribution", label: "My contribution",
                  type: "lines", hint: "One per line" },
                { key: "live_url", label: "Live demo URL", type: "url",
                  hint: "Leave empty to hide the LIVE PROJECT button" },
                { key: "github_url", label: "GitHub repository URL",
                  type: "url",
                  hint: "Leave empty to hide the GITHUB REPO button" },
                { key: "featured", label: "Featured", type: "checkbox",
                  hint: "Emphasised slab styling" },
                { key: "is_published", label: "Published", type: "checkbox",
                  hint: "Drafts are hidden from the public site" }
            ],
            primary: row => row.name,
            meta: row => [row.subtitle, row.status, row.tagline]
                .filter(Boolean).join("  ·  "),
            extraBadges: row => {
                const kind = row.status_kind || "done";
                const cls =
                    kind === "live" ? "badge-live" :
                    kind === "building" ? "badge-building" : "badge-plain";
                return `<span class="badge ${cls}">${esc(row.status || "")}</span>`;
            },
            searchable: row => [
                row.name, row.slug, row.subtitle, row.status,
                (row.tech || []).join(" "), (row.full_tech || []).join(" ")
            ].join(" "),
            preview: row => `
                <div class="preview-box">
                    <span class="badge badge-plain">PROJECT SLAB</span>
                    <h4 style="margin-top:10px">${esc(row.name)}</h4>
                    <p class="preview-sub">${esc(row.subtitle)}</p>
                    <div class="preview-tags">
                        ${(row.tech || []).map(tag => `<span>${esc(tag)}</span>`).join("")}
                    </div>
                    <p style="color:var(--muted);font-size:13.5px;margin:14px 0 0;">
                        ${esc((row.overview || []).join(" ").slice(0, 340))}${(row.overview || []).join(" ").length > 340 ? "…" : ""}
                    </p>
                    <div class="preview-links">
                        ${row.live_url ? `<a href="${esc(row.live_url)}" target="_blank" rel="noopener">LIVE PROJECT ↗</a>` : ""}
                        ${row.github_url ? `<a href="${esc(row.github_url)}" target="_blank" rel="noopener">GITHUB REPO ↗</a>` : ""}
                    </div>
                </div>`
        },


        experiences: {
            table: "experiences",
            title: "Virtual Experience",
            singular: "Experience",
            addLabel: "Add experience",
            subtitle:
                "Virtual job simulations and practical experiences. " +
                "These are not conventional employment entries.",
            fileField: "certificate_path",
            fileFieldName: "certificate_name",
            fileLabel: "Certificate PDF",
            pdfFields: { issuer: "organization", date: "occurred_on" },
            defaults: {
                organization: "", title: "",
                experience_type: "Job Simulation · Forage",
                occurred_on: "", date_precision: "day",
                description: "", skills: [],
                is_published: true
            },
            fields: [
                { key: "organization", label: "Organization",
                  type: "text", required: true },
                { key: "title", label: "Program / role title", type: "text",
                  placeholder: "Data Analytics" },
                { key: "experience_type", label: "Experience type",
                  type: "text", placeholder: "Job Simulation · Forage" },
                { key: "occurred_on", label: "Date", type: "date" },
                { key: "date_precision", label: "Date precision",
                  type: "select",
                  options: [
                    ["day", "Day (30 August 2026)"],
                    ["month", "Month (August 2026)"],
                    ["year", "Year only (2026)"]
                  ] },
                { key: "description", label: "Description",
                  type: "textarea", required: true },
                { key: "skills", label: "Skills", type: "lines",
                  hint: "One per line" },
                { key: "is_published", label: "Published", type: "checkbox" }
            ],
            primary: row => `${row.organization}${row.title ? " — " + row.title : ""}`,
            meta: row => [
                row.experience_type,
                row.occurred_on,
                row.certificate_name || ""
            ].filter(Boolean).join("  ·  "),
            searchable: row => [
                row.organization, row.title, row.experience_type,
                row.description, (row.skills || []).join(" ")
            ].join(" "),
            preview: row => `
                <div class="preview-box">
                    <span class="badge badge-plain">${esc(row.experience_type || "EXPERIENCE")}</span>
                    <h4 style="margin-top:10px">${esc(row.organization)}${row.title ? " — " + esc(row.title) : ""}</h4>
                    <p class="preview-sub">${esc(row.occurred_on || "")}</p>
                    <p style="color:var(--muted);font-size:14px;">${esc(row.description)}</p>
                    <div class="preview-links">
                        <a data-cert-link href="#" target="_blank" rel="noopener">VIEW CERTIFICATE ↗</a>
                    </div>
                </div>`
        },


        highlights: {
            table: "highlights",
            title: "Recent Highlights",
            singular: "Highlight",
            addLabel: "Add highlight",
            subtitle:
                "Certificates, hackathons and milestones shown in the " +
                "Recent Highlights timeline.",
            fileField: "certificate_path",
            fileFieldName: "certificate_name",
            fileLabel: "Certificate PDF",
            pdfFields: { title: "title", issuer: "issuer", date: "occurred_on" },
            defaults: {
                title: "", issuer: "", kind: "CERTIFICATION",
                occurred_on: "", date_precision: "year",
                description: "", credential_id: null, verification_url: null,
                profile_url: null, project_label: null, project_url: null,
                feature: false, is_published: true
            },
            fields: [
                { key: "title", label: "Title", type: "text", required: true,
                  placeholder: "SAP Certification" },
                { key: "issuer", label: "Issuer", type: "text",
                  placeholder: "SAP" },
                { key: "kind", label: "Kind", type: "textlist",
                  placeholder: "CERTIFICATION",
                  options: ["CERTIFICATION", "HACKATHON",
                            "KAGGLE COMPETITION", "COURSE", "MILESTONE"],
                  hint: "Small label above the title" },
                { key: "occurred_on", label: "Date", type: "date" },
                { key: "date_precision", label: "Date precision",
                  type: "select",
                  options: [
                    ["year", "Year only (2026)"],
                    ["month", "Month (August 2026)"],
                    ["day", "Day (30 August 2026)"]
                  ] },
                { key: "description", label: "Description", type: "textarea" },
                { key: "credential_id", label: "Credential ID",
                  type: "text", optional: true },
                { key: "verification_url", label: "Verification URL",
                  type: "url", optional: true },
                { key: "profile_url", label: "Profile URL",
                  type: "url", optional: true,
                  hint: "e.g. Kaggle profile" },
                { key: "project_label", label: "Related project label",
                  type: "text", optional: true,
                  placeholder: "INTERVUE AI" },
                { key: "project_url", label: "Related project URL",
                  type: "url", optional: true },
                { key: "feature", label: "Feature this highlight",
                  type: "checkbox" },
                { key: "is_published", label: "Published", type: "checkbox" }
            ],
            primary: row => row.title,
            meta: row => [
                row.kind, row.issuer, row.occurred_on,
                row.credential_id ? "ID: " + row.credential_id : "",
                row.certificate_name || ""
            ].filter(Boolean).join("  ·  "),
            searchable: row => [
                row.title, row.issuer, row.kind, row.description,
                row.credential_id, row.certificate_name
            ].join(" "),
            preview: row => `
                <div class="preview-box">
                    <span class="badge badge-plain">${esc(row.kind || "HIGHLIGHT")}</span>
                    <h4 style="margin-top:10px">${esc(row.title)}</h4>
                    <p class="preview-sub">${esc(row.issuer || "")} ${row.occurred_on ? "· " + esc(row.occurred_on) : ""}</p>
                    <p style="color:var(--muted);font-size:14px;">${esc(row.description)}</p>
                    ${row.credential_id ? `<p style="font-size:13px;color:var(--muted-2);">Credential ID: ${esc(row.credential_id)}</p>` : ""}
                    <div class="preview-links">
                        <a data-cert-link href="#" target="_blank" rel="noopener">VIEW CERTIFICATE ↗</a>
                        ${row.verification_url ? `<a href="${esc(row.verification_url)}" target="_blank" rel="noopener">VERIFY ↗</a>` : ""}
                        ${row.profile_url ? `<a href="${esc(row.profile_url)}" target="_blank" rel="noopener">PROFILE ↗</a>` : ""}
                        ${row.project_url ? `<a href="${esc(row.project_url)}" target="_blank" rel="noopener">BUILT ${esc(row.project_label || "PROJECT")} ↗</a>` : ""}
                    </div>
                </div>`
        },


        achievements: {
            table: "achievements",
            title: "Achievements",
            singular: "Achievement",
            addLabel: "Add achievement",
            subtitle: "Milestones and recognition shown on the home page.",
            defaults: {
                title: "", range_label: "", description: "",
                tag: null, featured: false, is_published: true
            },
            fields: [
                { key: "title", label: "Title", type: "text", required: true,
                  placeholder: "JPL Cricket — Runner-Up" },
                { key: "range_label", label: "Range / year",
                  type: "text", placeholder: "2025" },
                { key: "description", label: "Description", type: "textarea" },
                { key: "tag", label: "Tag", type: "text", optional: true,
                  placeholder: "Scholarship-linked" },
                { key: "featured", label: "Featured", type: "checkbox" },
                { key: "is_published", label: "Published", type: "checkbox" }
            ],
            primary: row => row.title,
            meta: row => [row.range_label, row.tag, row.description]
                .filter(Boolean).join("  ·  "),
            searchable: row => [
                row.title, row.range_label, row.tag, row.description
            ].join(" "),
            preview: row => `
                <div class="preview-box">
                    <span class="badge badge-plain">${esc(row.range_label || "ACHIEVEMENT")}</span>
                    <h4 style="margin-top:10px">${esc(row.title)}</h4>
                    <p class="preview-sub">${esc(row.tag || "")}</p>
                    <p style="color:var(--muted);font-size:14px;">${esc(row.description)}</p>
                </div>`
        },


        skills: {
            table: "skills",
            title: "Skills",
            singular: "Skill",
            addLabel: "Add skill",
            subtitle:
                "Skills are grouped into category cards on the public site. " +
                "Rows sharing a category label form one card.",
            defaults: {
                name: "", category: "General", category_icon: null,
                icon: null, featured: false, is_published: true
            },
            fields: [
                { key: "name", label: "Skill name", type: "text",
                  required: true, placeholder: "React" },
                { key: "category", label: "Category", type: "text",
                  required: true, placeholder: "Frontend" },
                { key: "category_icon", label: "Category icon",
                  type: "text", optional: true,
                  hint: "Bootstrap icon for the card, e.g. bi-window" },
                { key: "icon", label: "Skill icon (optional)",
                  type: "text", optional: true,
                  hint: "Stored for future use, e.g. bi-react" },
                { key: "featured", label: "Featured", type: "checkbox" },
                { key: "is_published", label: "Published", type: "checkbox" }
            ],
            primary: row => row.name,
            meta: row => [row.category, row.category_icon || ""]
                .filter(Boolean).join("  ·  "),
            searchable: row => [row.name, row.category].join(" "),
            preview: row => `
                <div class="preview-box">
                    <span class="badge badge-plain">${esc(row.category)}</span>
                    <div class="preview-tags" style="margin-top:12px;">
                        <span><i class="bi ${esc(row.category_icon || "bi-code-square")}"></i>
                        ${esc(row.name)}</span>
                    </div>
                </div>`
        },


        social_links: {
            table: "social_links",
            title: "Social Links",
            singular: "Social link",
            addLabel: "Add link",
            subtitle:
                "Shown in the hero, footer and contact cards. " +
                "Contact email/phone live in Site Settings.",
            defaults: {
                platform: "github", label: "", url: "", is_published: true
            },
            fields: [
                { key: "platform", label: "Platform", type: "select",
                  options: [
                    ["github", "GitHub"], ["linkedin", "LinkedIn"],
                    ["kaggle", "Kaggle"], ["leetcode", "LeetCode"],
                    ["email", "Email"], ["twitter", "X / Twitter"],
                    ["instagram", "Instagram"], ["youtube", "YouTube"],
                    ["website", "Website"]
                  ] },
                { key: "label", label: "Label", type: "text",
                  required: true,
                  hint: "Accessible label on the icon, e.g. GitHub" },
                { key: "url", label: "URL", type: "text", required: true,
                  placeholder: "https://… or mailto:…" },
                { key: "is_published", label: "Published", type: "checkbox" }
            ],
            primary: row => row.label || row.platform,
            meta: row => row.url,
            searchable: row => [row.label, row.platform, row.url].join(" "),
            preview: row => `
                <div class="preview-box">
                    <div class="preview-links">
                        <a href="${esc(row.url)}" target="_blank" rel="noopener">${esc(row.label || row.platform)} ↗</a>
                    </div>
                </div>`
        }
    };


    const PAGE_META = {
        overview: {
            title: "Overview",
            subtitle: "Everything on the portfolio, in one place."
        },
        settings: {
            title: "Site Settings",
            subtitle: "Contact details, résumé link and other key/value settings."
        }
    };

    Object.keys(ENTITIES).forEach(key => {
        PAGE_META[key] = {
            title: ENTITIES[key].title,
            subtitle: ENTITIES[key].subtitle
        };
    });


    /* ---------- State ---------- */

    const state = {
        page: "overview",
        rows: {},
        query: "",
        filter: "all"
    };

    let currentUser = null;


    /* ==================================================
       AUTH
    ================================================== */

    function showLogin(message) {

        $("#appScreen").hidden = true;
        $("#loginScreen").style.display = "flex";

        const error = $("#loginError");

        if (message) {
            error.textContent = message;
            error.hidden = false;
        } else {
            error.hidden = true;
        }
    }


    function showApp(user) {

        currentUser = user;

        $("#loginScreen").style.display = "none";
        $("#appScreen").hidden = false;
        $("#whoami").textContent = user.email || user.id;

        navigate(state.page || "overview");
    }


    async function verifyAdmin(user) {

        const { data, error } = await supabase
            .from("admins")
            .select("user_id, email")
            .eq("user_id", user.id)
            .maybeSingle();

        if (error) {
            throw error;
        }

        return Boolean(data);
    }


    /* Sentinel so the very first "no session" state still runs
       showLogin() once (a real null would dedupe against this). */
    let handledToken = "\u0000initial";

    async function handleSession(session) {

        const token = session ? session.access_token : null;

        if (token === handledToken) {
            return;
        }

        handledToken = token;

        if (!session) {
            currentUser = null;
            showLogin();
            return;
        }

        try {

            const authorized = await verifyAdmin(session.user);

            if (!authorized) {

                await supabase.auth.signOut();
                handledToken = null;

                showLogin(
                    "This account is not authorized. Add your user id to the " +
                    "`admins` table in the Supabase SQL Editor (step 3 in SETUP.md), " +
                    "then sign in again."
                );
                return;
            }

            showApp(session.user);

        } catch (error) {

            showLogin(
                "Could not verify administrator access: " +
                (error.message || String(error))
            );
        }
    }


    /* ==================================================
       DATA ACCESS
    ================================================== */

    async function loadRows(table) {

        const { data, error } = await supabase
            .from(table)
            .select("*")
            .order("sort_order", { ascending: true });

        if (error) {
            throw error;
        }

        return data || [];
    }


    async function countRows(table) {

        const { count, error } = await supabase
            .from(table)
            .select("id", { count: "exact", head: true });

        if (error) {
            throw error;
        }

        return count || 0;
    }


    function nextOrder(rows) {

        return rows.reduce(
            (max, row) => Math.max(max, row.sort_order || 0), 0
        ) + 1;
    }


    /* ==================================================
       STORAGE
    ================================================== */

    function validatePdf(file) {

        const isPdf =
            file.type === "application/pdf" || /\.pdf$/i.test(file.name);

        if (!isPdf) {
            throw new Error(`"${file.name}" is not a PDF.`);
        }

        if (file.size > MAX_PDF_BYTES) {
            throw new Error(
                `"${file.name}" is larger than 25 MB — please upload a smaller PDF.`
            );
        }
    }


    function safeName(name) {

        const cleaned = String(name)
            .replace(/[^a-zA-Z0-9._-]+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");

        return (cleaned || "document.pdf").slice(-80);
    }


    async function uploadPrivate(file) {

        const path = `${Date.now()}-${safeName(file.name)}`;

        const { error } = await supabase.storage
            .from(PRIVATE_BUCKET)
            .upload(path, file, {
                contentType: "application/pdf",
                upsert: false
            });

        if (error) {
            throw error;
        }

        return `${PRIVATE_BUCKET}/${path}`;
    }


    async function uploadPublic(file) {

        const path = `${Date.now()}-${safeName(file.name)}`;

        const { error } = await supabase.storage
            .from(PUBLIC_BUCKET)
            .upload(path, file, {
                contentType: "application/pdf",
                upsert: false
            });

        if (error) {
            throw error;
        }

        return `${PUBLIC_BUCKET}/${path}`;
    }


    /* Published files get a copy in the public bucket; unpublishing
       removes that copy. The private copy is always kept. */
    async function syncPublicFile(path, publish) {

        if (!path || !path.startsWith(PRIVATE_BUCKET + "/")) {
            return;
        }

        const object = path.slice(PRIVATE_BUCKET.length + 1);

        if (publish) {

            const { data, error } = await supabase.storage
                .from(PRIVATE_BUCKET)
                .download(object);

            if (error) {
                throw error;
            }

            const { error: uploadError } = await supabase.storage
                .from(PUBLIC_BUCKET)
                .upload(object, data, {
                    contentType: "application/pdf",
                    upsert: true
                });

            if (uploadError) {
                throw uploadError;
            }

        } else {

            await supabase.storage.from(PUBLIC_BUCKET).remove([object]);
        }
    }


    async function removeFile(path) {

        if (!path) {
            return;
        }

        if (path.startsWith(PRIVATE_BUCKET + "/")) {

            const object = path.slice(PRIVATE_BUCKET.length + 1);

            await supabase.storage.from(PRIVATE_BUCKET).remove([object]);
            await supabase.storage.from(PUBLIC_BUCKET).remove([object]);

        } else if (path.startsWith(PUBLIC_BUCKET + "/")) {

            await supabase.storage
                .from(PUBLIC_BUCKET)
                .remove([path.slice(PUBLIC_BUCKET.length + 1)]);
        }

        /* assets/… files ship with the site — nothing to delete. */
    }


    function publicUrl(path) {

        if (!path) {
            return null;
        }

        if (/^https?:\/\//i.test(path)) {
            return path;
        }

        if (path.startsWith(PRIVATE_BUCKET + "/")) {

            return `${env.SUPABASE_URL}/storage/v1/object/public/` +
                `${PUBLIC_BUCKET}/${path.slice(PRIVATE_BUCKET.length + 1)}`;
        }

        if (path.startsWith(PUBLIC_BUCKET + "/")) {
            return `${env.SUPABASE_URL}/storage/v1/object/public/${path}`;
        }

        return path;
    }


    async function previewUrl(path) {

        if (path && path.startsWith(PRIVATE_BUCKET + "/")) {

            const { data, error } = await supabase.storage
                .from(PRIVATE_BUCKET)
                .download(path.slice(PRIVATE_BUCKET.length + 1));

            if (!error && data) {
                return URL.createObjectURL(data);
            }
        }

        return publicUrl(path);
    }


    /* ==================================================
       PDF METADATA SUGGESTIONS (local, no paid services)
    ================================================== */

    let pdfjsPromise = null;

    function loadPdfJs() {

        if (window.pdfjsLib) {
            return Promise.resolve(window.pdfjsLib);
        }

        if (pdfjsPromise) {
            return pdfjsPromise;
        }

        pdfjsPromise = new Promise((resolve, reject) => {

            const script = document.createElement("script");

            script.src =
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";

            script.onload = () => {

                if (window.pdfjsLib) {
                    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
                    resolve(window.pdfjsLib);
                } else {
                    reject(new Error("pdf.js unavailable"));
                }
            };

            script.onerror = () => reject(new Error("pdf.js failed to load"));

            document.head.appendChild(script);
        });

        return pdfjsPromise;
    }


    const ISSUER_HINTS = [
        "Amazon Web Services", "Google Cloud", "Microsoft", "Salesforce",
        "SAP", "Oracle", "IBM", "Meta", "Coursera", "Forage", "Deloitte",
        "HackerRank", "GeeksforGeeks", "WeMakeDevs", "lablab.ai",
        "AssemblyAI", "Kaggle", "AWS", "Google", "GitHub", "Adobe", "NVIDIA"
    ];

    const MONTH_PATTERN =
        "Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|" +
        "Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|" +
        "Dec(?:ember)?";

    const MONTH_INDEX = {
        jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
        jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
    };


    function toIsoDate(raw) {

        if (!raw) {
            return null;
        }

        let match = new RegExp(
            `(\\d{1,2})\\s+(${MONTH_PATTERN})\\.?\\s*,?\\s*(\\d{4})`, "i"
        ).exec(raw);

        if (match) {
            return iso(match[3], MONTH_INDEX[match[2].slice(0, 3).toLowerCase()], match[1]);
        }

        match = new RegExp(
            `(${MONTH_PATTERN})\\.?\\s+(\\d{1,2}),?\\s+(\\d{4})`, "i"
        ).exec(raw);

        if (match) {
            return iso(match[3], MONTH_INDEX[match[1].slice(0, 3).toLowerCase()], match[2]);
        }

        match = /(\d{4})-(\d{2})-(\d{2})/.exec(raw);

        if (match) {
            return raw.slice(0, 10);
        }

        match = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(raw);

        if (match) {
            return iso(match[3], match[2], match[1]);
        }

        return null;
    }


    function iso(year, month, day) {

        const pad = value => String(value).padStart(2, "0");

        const safeMonth = Math.min(12, Math.max(1, parseInt(month, 10)));
        const safeDay = Math.min(31, Math.max(1, parseInt(day, 10)));

        return `${year}-${pad(safeMonth)}-${pad(safeDay)}`;
    }


    async function extractPdfHints(file) {

        let text = "";

        try {

            const pdfjs = await loadPdfJs();

            const buffer = await file.arrayBuffer();

            const document_ = await pdfjs.getDocument({ data: buffer }).promise;

            const page = await document_.getPage(1);

            const content = await page.getTextContent();

            text = content.items
                .map(item => item.str + (item.hasEOL ? "\n" : " "))
                .join("");

        } catch (error) {
            return { error:
                "Could not read text from this PDF (it may be a scanned " +
                "image). Fill in the details yourself." };
        }

        const hints = {};

        const lines_ = text
            .split(/\n+/)
            .map(line => line.replace(/\s+/g, " ").trim())
            .filter(line => line.length > 3);

        /* Title: the first meaningful headline-sized line. */
        const titleLine = lines_.find(line =>
            line.length >= 8 && line.length <= 90 &&
            !/certificate of|this is to certify|congratulations|awarded to|has (?:successfully )?completed/i.test(line)
        );

        if (titleLine) {
            hints.title = titleLine;
        }

        /* Issuer: a known issuer name present in the text. */
        const issuer = ISSUER_HINTS.find(name =>
            new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i")
                .test(text)
        );

        if (issuer) {
            hints.issuer = issuer;
        }

        /* Date: the first recognisable full date. */
        const dateMatch = new RegExp(
            `\\b(?:\\d{1,2}\\s+${MONTH_PATTERN}\\.?,?\\s+\\d{4}|` +
            `${MONTH_PATTERN}\\.?\\s+\\d{1,2},?\\s+\\d{4})\\b`, "i"
        ).exec(text) || /\b\d{1,2}\/\d{1,2}\/\d{4}\b/.exec(text);

        if (dateMatch) {
            hints.date = dateMatch[0];
        }

        return { hints };
    }


    /* ==================================================
       NAVIGATION
    ================================================== */

    function navigate(page) {

        state.page = page;
        state.query = "";
        state.filter = "all";

        $$("#sideNav button").forEach(button => {
            button.classList.toggle("active", button.dataset.page === page);
        });

        const meta = PAGE_META[page] || { title: page, subtitle: "" };

        $("#pageTitle").textContent = meta.title;
        $("#pageSubtitle").textContent = meta.subtitle;

        closeSidebar();
        renderPage();
    }


    async function renderPage() {

        const body = $("#pageBody");

        body.innerHTML = `<div class="panel"><div class="loading-state">Loading…</div></div>`;

        try {

            if (state.page === "overview") {
                await renderOverview(body);
            } else if (state.page === "settings") {
                await renderSettings(body);
            } else {
                await renderEntityPage(body, state.page);
            }

        } catch (error) {

            body.innerHTML =
                `<div class="panel">
                    <div class="empty-state">
                        Could not load this section:
                        ${esc(error.message || String(error))}
                    </div>
                </div>`;

            toast("Load failed: " + (error.message || String(error)), "error");
        }
    }


    /* ==================================================
       OVERVIEW
    ================================================== */

    async function renderOverview(body) {

        const keys = Object.keys(ENTITIES);

        const counts = await Promise.all(
            keys.map(key => countRows(ENTITIES[key].table))
        );

        const settingsCount = await countRows("site_settings");

        body.innerHTML = `
            <div class="panel">
                <div class="panel-head">
                    <div>
                        <h3>Content</h3>
                        <div class="row-meta" style="margin-top:4px;">
                            Click a card to manage it. Changes go live on the
                            public site on the next page load — no redeploy.
                        </div>
                    </div>
                </div>
                <div class="stat-grid">
                    ${keys.map((key, index) => `
                        <button type="button" class="stat-card" data-goto="${key}">
                            <div class="stat-value">${counts[index]}</div>
                            <div class="stat-label">${esc(ENTITIES[key].title)}</div>
                        </button>
                    `).join("")}
                    <button type="button" class="stat-card" data-goto="settings">
                        <div class="stat-value">${settingsCount}</div>
                        <div class="stat-label">Settings</div>
                    </button>
                </div>
            </div>

            <div class="panel">
                <div class="panel-head"><h3>Environment</h3></div>
                <ul class="hint-list">
                    <li>Supabase project: <code>${esc(env.SUPABASE_URL || "not set")}</code></li>
                    <li>Publishable key: <code>${isConfigured() ? "configured" : "missing — paste it into js/config.js"}</code></li>
                    <li>Signed in as: <code>${esc(currentUser && currentUser.email || "—")}</code></li>
                    <li>Storage buckets: <code>${esc(PUBLIC_BUCKET)}</code> (public, published files)
                        and <code>${esc(PRIVATE_BUCKET)}</code> (admin only, drafts)</li>
                </ul>
            </div>

            <div class="panel">
                <div class="panel-head"><h3>How publishing works</h3></div>
                <ul class="hint-list">
                    <li>Rows marked <strong>Draft</strong> are hidden from the public
                        site — Row Level Security blocks them at the database.</li>
                    <li>Reordering uses the arrows on each row and is saved immediately.</li>
                    <li>Certificate PDFs upload to private storage first; publishing a
                        record copies its PDF into the public bucket, unpublishing
                        removes the public copy.</li>
                    <li>Nothing here deploys code — the public site reads Supabase on
                        every visit.</li>
                </ul>
            </div>
        `;

        $$("[data-goto]", body).forEach(button => {
            button.addEventListener("click", () => navigate(button.dataset.goto));
        });
    }


    /* ==================================================
       ENTITY LIST PAGE
    ================================================== */

    async function renderEntityPage(body, key) {

        const entity = ENTITIES[key];

        const rows = await loadRows(entity.table);

        state.rows[key] = rows;

        body.innerHTML = `
            <div class="panel">
                <div class="panel-head">
                    <div>
                        <h3>${esc(entity.title)}</h3>
                        <div class="row-meta" style="margin-top:4px;">
                            ${esc(entity.subtitle)}
                        </div>
                    </div>
                    <button type="button" class="btn-primary" id="addBtn">
                        <i class="bi bi-plus-lg"></i> ${esc(entity.addLabel)}
                    </button>
                </div>

                <div class="toolbar">
                    <input type="search" id="searchInput"
                           placeholder="Search ${esc(entity.title.toLowerCase())}…"
                           value="${esc(state.query)}">

                    <select id="statusFilter">
                        <option value="all">All states</option>
                        <option value="published">Published only</option>
                        <option value="draft">Drafts only</option>
                    </select>
                </div>

                <div class="list" id="listBody"></div>
            </div>
        `;

        $("#addBtn").addEventListener("click", () => openForm(key, null));

        $("#searchInput").addEventListener("input", event => {
            state.query = event.target.value;
            paintList(key);
        });

        const statusFilter = $("#statusFilter");

        statusFilter.value = state.filter;

        statusFilter.addEventListener("change", event => {
            state.filter = event.target.value;
            paintList(key);
        });

        paintList(key);
    }


    function paintList(key) {

        const entity = ENTITIES[key];
        const all = state.rows[key] || [];

        const query = state.query.trim().toLowerCase();

        const visible = all.filter(row => {

            const matchesQuery =
                !query ||
                (entity.searchable(row) || "").toLowerCase().includes(query);

            const matchesState =
                state.filter === "all" ||
                (state.filter === "published"
                    ? row.is_published
                    : !row.is_published);

            return matchesQuery && matchesState;
        });

        const list = $("#listBody");

        if (!list) {
            return;
        }

        if (visible.length === 0) {

            list.innerHTML = `<div class="empty-state">${
                query || state.filter !== "all"
                    ? "Nothing matches this search or filter."
                    : "Nothing here yet — use the button above to add one."
            }</div>`;
            return;
        }

        list.innerHTML = visible.map(row => {

            const index = all.indexOf(row);

            return `
                <div class="row-item" data-id="${esc(row.id)}">
                    <div class="row-order">
                        <button type="button" data-act="up"
                                ${index <= 0 ? "disabled" : ""}
                                title="Move up">▲</button>
                        <button type="button" data-act="down"
                                ${index >= all.length - 1 ? "disabled" : ""}
                                title="Move down">▼</button>
                    </div>

                    <div class="row-main">
                        <div class="row-title">
                            ${esc(entity.primary(row) || "(untitled)")}
                            ${entity.extraBadges ? entity.extraBadges(row) : ""}
                            <span class="badge ${row.is_published ? "badge-pub" : "badge-draft"}">
                                ${row.is_published ? "Published" : "Draft"}
                            </span>
                        </div>
                        <div class="row-meta">${esc(entity.meta(row) || "")}</div>
                    </div>

                    <div class="row-actions">
                        <button type="button" class="btn-mini" data-act="preview">
                            <i class="bi bi-eye"></i> Preview
                        </button>
                        <button type="button" class="btn-mini" data-act="toggle">
                            <i class="bi ${row.is_published ? "bi-eye-slash" : "bi-eye"}"></i>
                            ${row.is_published ? "Unpublish" : "Publish"}
                        </button>
                        <button type="button" class="btn-mini" data-act="edit">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                        <button type="button" class="btn-mini danger" data-act="delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join("");

        $$(".row-item", list).forEach(node => {

            const row = all.find(item => String(item.id) === node.dataset.id);

            if (!row) {
                return;
            }

            const up = $("[data-act='up']", node);
            const down = $("[data-act='down']", node);
            const preview = $("[data-act='preview']", node);
            const toggle = $("[data-act='toggle']", node);
            const edit = $("[data-act='edit']", node);
            const remove = $("[data-act='delete']", node);

            up.addEventListener("click", () => moveRow(key, row, -1));
            down.addEventListener("click", () => moveRow(key, row, 1));
            preview.addEventListener("click", () => openPreview(key, row));
            toggle.addEventListener("click", () => togglePublish(key, row));
            edit.addEventListener("click", () => openForm(key, row));
            remove.addEventListener("click", () => deleteRow(key, row));
        });
    }


    /* ---------- Reorder ---------- */

    async function moveRow(key, row, direction) {

        const entity = ENTITIES[key];
        const all = state.rows[key] || [];

        const index = all.indexOf(row);
        const target = index + direction;

        if (index < 0 || target < 0 || target >= all.length) {
            return;
        }

        const other = all[target];

        try {

            const first = await supabase
                .from(entity.table)
                .update({ sort_order: other.sort_order })
                .eq("id", row.id);

            if (first.error) {
                throw first.error;
            }

            const second = await supabase
                .from(entity.table)
                .update({ sort_order: row.sort_order })
                .eq("id", other.id);

            if (second.error) {
                throw second.error;
            }

            all[index] = other;
            all[target] = row;

            paintList(key);
            toast("Order updated.");

        } catch (error) {
            toast("Reorder failed: " + (error.message || String(error)), "error");
        }
    }


    /* ---------- Publish / unpublish ---------- */

    async function togglePublish(key, row) {

        const entity = ENTITIES[key];
        const next = !row.is_published;

        try {

            if (entity.fileField) {
                await syncPublicFile(row[entity.fileField], next);
            }

            const { error } = await supabase
                .from(entity.table)
                .update({ is_published: next })
                .eq("id", row.id);

            if (error) {
                throw error;
            }

            row.is_published = next;
            paintList(key);

            toast(next
                ? "Published — visible on the public site."
                : "Unpublished — hidden from the public site.");

        } catch (error) {

            toast(
                "Could not change publication state: " +
                (error.message || String(error)),
                "error"
            );
        }
    }


    /* ---------- Delete ---------- */

    async function deleteRow(key, row) {

        const entity = ENTITIES[key];

        const confirmed = await confirmDialog({
            title: `Delete ${entity.singular.toLowerCase()}?`,
            message:
                `“${entity.primary(row)}” will be permanently removed, ` +
                `along with any uploaded file. This cannot be undone.`,
            confirmLabel: "Delete"
        });

        if (!confirmed) {
            return;
        }

        try {

            if (entity.fileField && row[entity.fileField]) {
                await removeFile(row[entity.fileField]);
            }

            const { error } = await supabase
                .from(entity.table)
                .delete()
                .eq("id", row.id);

            if (error) {
                throw error;
            }

            state.rows[key] = (state.rows[key] || [])
                .filter(item => item.id !== row.id);

            paintList(key);
            toast(`${entity.singular} deleted.`);

        } catch (error) {
            toast("Delete failed: " + (error.message || String(error)), "error");
        }
    }


    /* ==================================================
       FORM MODAL
    ================================================== */

    function fieldHTML(field, values) {

        const value = values[field.key];

        if (field.type === "checkbox") {

            return `
                <label class="check-field">
                    <input type="checkbox" name="${esc(field.key)}"
                           ${value ? "checked" : ""}>
                    <span>
                        ${esc(field.label)}
                        ${field.hint ? `<small>${esc(field.hint)}</small>` : ""}
                    </span>
                </label>
            `;
        }

        let control = "";

        switch (field.type) {

            case "textarea":
                control =
                    `<textarea name="${esc(field.key)}" rows="4">${
                        esc(value || "")
                    }</textarea>`;
                break;

            case "lines":
                control =
                    `<textarea name="${esc(field.key)}" rows="${
                        field.rows || 5
                    }">${esc(lines(value))}</textarea>`;
                break;

            case "select":
                control =
                    `<select name="${esc(field.key)}">
                        ${(field.options || []).map(option => `
                            <option value="${esc(option[0])}"
                                ${String(value) === String(option[0]) ? "selected" : ""}>
                                ${esc(option[1])}
                            </option>
                        `).join("")}
                    </select>`;
                break;

            case "textlist":
                control =
                    `<input type="text" name="${esc(field.key)}"
                            list="dl-${esc(field.key)}"
                            value="${esc(value || "")}"
                            placeholder="${esc(field.placeholder || "")}">
                     <datalist id="dl-${esc(field.key)}">
                        ${(field.options || []).map(option =>
                            `<option value="${esc(option)}"></option>`).join("")}
                     </datalist>`;
                break;

            case "date":
                control =
                    `<input type="date" name="${esc(field.key)}"
                            value="${esc(value || "")}">`;
                break;

            case "url":
                control =
                    `<input type="url" name="${esc(field.key)}"
                            value="${esc(value || "")}"
                            placeholder="${esc(field.placeholder || "https://")}">`;
                break;

            default:
                control =
                    `<input type="text" name="${esc(field.key)}"
                            value="${esc(value || "")}"
                            placeholder="${esc(field.placeholder || "")}">`;
        }

        return `
            <div class="field">
                <label>${esc(field.label)}${field.optional ? " (optional)" : ""}</label>
                ${control}
                ${field.hint ? `<span class="hint">${esc(field.hint)}</span>` : ""}
            </div>
        `;
    }


    function openForm(key, row) {

        const entity = ENTITIES[key];

        const values = Object.assign(
            {},
            entity.defaults,
            row || {}
        );

        const fileState = {
            file: null,
            removed: false,
            path: row && entity.fileField ? row[entity.fileField] : null,
            name: row && entity.fileFieldName
                ? row[entity.fileFieldName] : null
        };

        let fieldsHTML = entity.fields.map(field => fieldHTML(field, values))
            .join("");

        if (entity.fileField) {

            fieldsHTML += `
                <div class="field">
                    <label>${esc(entity.fileLabel)}</label>
                    <div class="file-box">
                        <input type="file" accept="application/pdf,.pdf"
                               data-file-input>

                        <div class="file-current" data-file-current
                             ${fileState.path ? "" : "hidden"}>
                            <span>
                                Current:
                                <a data-file-link href="#" target="_blank"
                                   rel="noopener">${esc(fileState.name || "open file")}</a>
                            </span>
                            <label style="display:flex;gap:7px;align-items:center;">
                                <input type="checkbox" data-file-remove>
                                Remove file
                            </label>
                        </div>

                        <div class="pdf-hints" data-pdf-hints hidden></div>
                    </div>
                    <span class="hint">${esc(FILE_HINT)}</span>
                </div>
            `;
        }

        openModal({
            title: `${row ? "Edit" : "Add"} ${entity.singular.toLowerCase()}`,
            body: `<form id="entityForm" novalidate>${fieldsHTML}</form>`,
            actions: [
                {
                    label: "Cancel",
                    className: "btn-ghost",
                    onClick: close => close()
                },
                {
                    label: row ? "Save changes" : entity.addLabel,
                    className: "btn-primary",
                    onClick: close => submit(close)
                }
            ],
            onMount: body => {

                if (entity.fileField) {
                    wireFileField(body, entity, fileState, values);
                }
            }
        });


        /* ----- validation + save ----- */

        function collect() {

            const form = $("#entityForm");
            const payload = {};

            entity.fields.forEach(field => {

                const control = form.querySelector(`[name="${field.key}"]`);

                if (!control) {
                    return;
                }

                if (field.type === "checkbox") {
                    payload[field.key] = control.checked;
                    return;
                }

                if (field.type === "lines") {
                    payload[field.key] = control.value
                        .split("\n")
                        .map(item => item.trim())
                        .filter(Boolean);
                    return;
                }

                const raw = control.value.trim();

                if (field.type === "url") {
                    payload[field.key] = raw === "" ? null : raw;
                    return;
                }

                if (raw === "" && field.optional) {
                    payload[field.key] = null;
                    return;
                }

                payload[field.key] = raw;
            });

            return payload;
        }


        function validate(payload) {

            const problems = [];

            entity.fields.forEach(field => {

                if (!field.required) {
                    return;
                }

                const value = payload[field.key];

                if (value === null || value === undefined || value === "" ||
                    (Array.isArray(value) && value.length === 0)) {
                    problems.push(`“${field.label}” is required.`);
                }
            });

            entity.fields
                .filter(field => field.type === "url")
                .forEach(field => {

                    const value = payload[field.key];

                    if (!value) {
                        return;
                    }

                    if (!/^(https?:\/\/|mailto:)/i.test(value)) {
                        problems.push(
                            `“${field.label}” must start with https:// or mailto:.`
                        );
                    }
                });

            if (entity.table === "projects" && payload.slug &&
                !/^[a-z0-9-]+$/.test(payload.slug)) {
                problems.push("Slug may only contain lowercase letters, numbers and dashes.");
            }

            return problems;
        }


        async function submit(close) {

            const form = $("#entityForm");

            const payload = collect();

            const problems = validate(payload);

            if (problems.length > 0) {
                toast(problems[0], "error");

                const firstRequired =
                    entity.fields.find(field => field.required);

                const firstInvalid = firstRequired
                    ? form.querySelector(`[name="${firstRequired.key}"]`)
                    : null;

                if (firstInvalid) {
                    firstInvalid.focus();
                }
                return;
            }

            const submitButtons = $$(".modal-foot .btn-primary");
            submitButtons.forEach(button => { button.disabled = true; });

            let oldPath = fileState.path;

            try {

                if (entity.fileField) {

                    if (fileState.file) {

                        payload[entity.fileField] =
                            await uploadPrivate(fileState.file);
                        payload[entity.fileFieldName] = fileState.file.name;

                    } else if (fileState.removed) {

                        payload[entity.fileField] = null;
                        payload[entity.fileFieldName] = null;

                    } else {

                        payload[entity.fileField] = fileState.path;
                        payload[entity.fileFieldName] = fileState.name;
                    }
                }

                let saved;

                if (row) {

                    payload.sort_order = row.sort_order;

                    const result = await supabase
                        .from(entity.table)
                        .update(payload)
                        .eq("id", row.id)
                        .select()
                        .single();

                    if (result.error) {
                        throw result.error;
                    }

                    saved = result.data;

                    const all = state.rows[key];
                    const index = all.findIndex(item => item.id === row.id);

                    if (index >= 0) {
                        all[index] = saved;
                    }

                } else {

                    payload.sort_order = nextOrder(state.rows[key] || []);

                    const result = await supabase
                        .from(entity.table)
                        .insert(payload)
                        .select()
                        .single();

                    if (result.error) {
                        throw result.error;
                    }

                    saved = result.data;

                    state.rows[key] = (state.rows[key] || []).concat([saved])
                        .sort((a, b) => (a.sort_order - b.sort_order));
                }

                /* Keep storage in sync with publication state. */
                if (entity.fileField) {

                    const newPath = saved[entity.fileField];

                    if (newPath !== oldPath && oldPath) {
                        await removeFile(oldPath);
                    }

                    if (newPath) {
                        await syncPublicFile(newPath, saved.is_published);
                    }
                }

                close();
                paintList(key);

                toast(row
                    ? `${entity.singular} saved.`
                    : `${entity.singular} added.`);

            } catch (error) {

                toast(
                    "Save failed: " + (error.message || String(error)),
                    "error"
                );

                submitButtons.forEach(button => { button.disabled = false; });
            }
        }
    }


    /* ---------- file input wiring ---------- */

    function wireFileField(body, entity, fileState, values) {

        const input = $("[data-file-input]", body);
        const current = $("[data-file-current]", body);
        const remove = $("[data-file-remove]", body);
        const link = $("[data-file-link]", body);
        const hints = $("[data-pdf-hints]", body);

        if (fileState.path) {

            previewUrl(fileState.path).then(url => {

                if (url) {
                    link.href = url;
                } else {
                    link.removeAttribute("href");
                }
            }).catch(() => { /* preview link stays inert */ });
        }

        remove.addEventListener("change", () => {

            fileState.removed = remove.checked;
            current.hidden = remove.checked;

            if (remove.checked) {
                input.value = "";
                fileState.file = null;
                hints.hidden = true;
            }
        });

        input.addEventListener("change", async () => {

            const file = input.files && input.files[0];

            if (!file) {
                return;
            }

            try {
                validatePdf(file);
            } catch (error) {
                toast(error.message, "error");
                input.value = "";
                return;
            }

            fileState.file = file;
            fileState.removed = false;
            remove.checked = false;
            current.hidden = false;

            if (link) {
                link.textContent = file.name + " (not saved yet)";
                link.removeAttribute("href");
            }

            /* Suggest metadata from the PDF text — the admin confirms
               or corrects every value; nothing is applied silently. */
            hints.hidden = false;
            hints.innerHTML =
                `<div class="hint-title">Reading PDF…</div>`;

            const result = await extractPdfHints(file);

            if (result.error) {
                hints.innerHTML =
                    `<div class="hint-title">No suggestions</div>
                     <div>${esc(result.error)}</div>`;
                return;
            }

            const hintsMap = result.hints || {};

            const targets = [];

            if (hintsMap.title && entity.pdfFields && entity.pdfFields.title) {
                targets.push(["Title", hintsMap.title, entity.pdfFields.title]);
            }

            if (hintsMap.issuer && entity.pdfFields && entity.pdfFields.issuer) {
                targets.push(["Issuer", hintsMap.issuer, entity.pdfFields.issuer]);
            }

            if (hintsMap.date && entity.pdfFields && entity.pdfFields.date) {
                const isoDate = toIsoDate(hintsMap.date);
                if (isoDate) {
                    targets.push(["Date", hintsMap.date, entity.pdfFields.date, isoDate]);
                }
            }

            if (targets.length === 0) {

                hints.innerHTML =
                    `<div class="hint-title">No suggestions found</div>
                     <div>The PDF has no clearly readable metadata —
                     fill in the fields yourself.</div>`;
                return;
            }

            hints.innerHTML =
                `<div class="hint-title">Suggested from the PDF — confirm to apply</div>` +
                targets.map((target, index) => `
                    <div class="pdf-hint-line">
                        <span><strong>${esc(target[0])}:</strong> ${esc(target[1])}</span>
                        <button type="button" class="btn-mini" data-hint="${index}">
                            Use
                        </button>
                    </div>
                `).join("");

            $$("[data-hint]", hints).forEach(button => {

                button.addEventListener("click", () => {

                    const target = targets[Number(button.dataset.hint)];

                    const control =
                        $("#entityForm").querySelector(
                            `[name="${target[2]}"]`
                        );

                    if (control) {
                        control.value = target[3] || target[1];
                        control.dispatchEvent(new Event("input", { bubbles: true }));
                        toast(`Applied suggested ${target[0].toLowerCase()}. Review it before saving.`, "info");
                    }
                });
            });
        });
    }


    /* ==================================================
       PREVIEW
    ================================================== */

    function openPreview(key, row) {

        const entity = ENTITIES[key];

        openModal({
            title: `Preview — ${entity.singular}`,
            body: entity.preview(row),
            actions: [
                {
                    label: "Close",
                    className: "btn-ghost",
                    onClick: close => close()
                }
            ],
            onMount: body => {

                const link = $("[data-cert-link]", body);

                if (!link) {
                    return;
                }

                const path = entity.fileField ? row[entity.fileField] : null;

                if (!path) {
                    link.remove();
                    return;
                }

                previewUrl(path).then(url => {

                    if (url) {
                        link.href = url;
                    } else {
                        link.remove();
                    }
                }).catch(() => link.remove());
            }
        });
    }


    /* ==================================================
       SETTINGS PAGE
    ================================================== */

    async function renderSettings(body) {

        const { data, error } = await supabase
            .from("site_settings")
            .select("*")
            .order("key");

        if (error) {
            throw error;
        }

        const rows = data || [];

        body.innerHTML = `
            <div class="panel">
                <div class="panel-head">
                    <div>
                        <h3>Values</h3>
                        <div class="row-meta" style="margin-top:4px;">
                            Applied to the hero, contact section and résumé button.
                        </div>
                    </div>
                </div>

                <div id="settingsRows">
                    ${rows.map(row => `
                        <div class="setting-row" data-key="${esc(row.key)}">
                            <span class="key">${esc(row.key)}</span>
                            <input type="text" value="${esc(row.value)}">
                            <span style="display:flex;gap:7px;">
                                <button type="button" class="btn-mini" data-act="save">
                                    Save
                                </button>
                                <button type="button" class="btn-mini danger" data-act="del">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </span>
                        </div>
                    `).join("") || `<div class="empty-state">No settings yet.</div>`}
                </div>

                <div class="toolbar" style="margin-top:16px;">
                    <input type="text" id="newKey" placeholder="key (e.g. contact_email)">
                    <input type="text" id="newValue" placeholder="value" style="flex:2;min-width:200px;background:rgba(0,0,0,.28);border:1px solid var(--border);border-radius:9px;color:var(--text);padding:9px 12px;font-size:14px;outline:none;">
                    <button type="button" class="btn-ghost" id="addSetting">
                        Add setting
                    </button>
                </div>
            </div>

            <div class="panel">
                <div class="panel-head">
                    <div>
                        <h3>Résumé (PDF)</h3>
                        <div class="row-meta" style="margin-top:4px;">
                            Upload replaces the <code>resume_url</code> setting.
                            Stored in the public bucket (the résumé is meant to
                            be public).
                        </div>
                    </div>
                </div>

                <div class="file-box">
                    <input type="file" accept="application/pdf,.pdf" id="resumeInput">
                    <div class="file-current">
                        <span>Current:
                            <a href="${esc((rows.find(r => r.key === "resume_url") || {}).value || "#")}"
                               target="_blank" rel="noopener">resume</a>
                        </span>
                    </div>
                </div>
            </div>
        `;

        $$("#settingsRows .setting-row", body).forEach(node => {

            const key = node.dataset.key;
            const input = $("input", node);

            $("[data-act='save']", node).addEventListener("click", async () => {

                try {

                    const { error: upsertError } = await supabase
                        .from("site_settings")
                        .upsert({ key, value: input.value.trim() });

                    if (upsertError) {
                        throw upsertError;
                    }

                    toast(`“${key}” saved.`);

                } catch (saveError) {
                    toast("Save failed: " + (saveError.message || saveError), "error");
                }
            });

            $("[data-act='del']", node).addEventListener("click", async () => {

                const confirmed = await confirmDialog({
                    title: "Delete setting?",
                    message: `“${key}” will be removed.`,
                    confirmLabel: "Delete"
                });

                if (!confirmed) {
                    return;
                }

                try {

                    const { error: deleteError } = await supabase
                        .from("site_settings")
                        .delete()
                        .eq("key", key);

                    if (deleteError) {
                        throw deleteError;
                    }

                    toast("Setting deleted.");
                    renderPage();

                } catch (deleteFail) {
                    toast("Delete failed: " + (deleteFail.message || deleteFail), "error");
                }
            });
        });

        $("#addSetting").addEventListener("click", async () => {

            const key = $("#newKey").value.trim();
            const value = $("#newValue").value.trim();

            if (!key) {
                toast("A key is required.", "error");
                return;
            }

            try {

                const { error: insertError } = await supabase
                    .from("site_settings")
                    .upsert({ key, value });

                if (insertError) {
                    throw insertError;
                }

                toast(`“${key}” added.`);
                renderPage();

            } catch (insertFail) {
                toast("Add failed: " + (insertFail.message || insertFail), "error");
            }
        });

        $("#resumeInput").addEventListener("change", async event => {

            const file = event.target.files && event.target.files[0];

            if (!file) {
                return;
            }

            try {

                validatePdf(file);

                const path = await uploadPublic(file);

                const { error: upsertError } = await supabase
                    .from("site_settings")
                    .upsert({ key: "resume_url", value: publicUrl(path) });

                if (upsertError) {
                    throw upsertError;
                }

                toast("Résumé uploaded — the hero button now points to it.");
                renderPage();

            } catch (uploadFail) {
                toast("Résumé upload failed: " +
                    (uploadFail.message || uploadFail), "error");
                event.target.value = "";
            }
        });
    }


    /* ==================================================
       SIDEBAR / STATIC WIRING
    ================================================== */

    function openSidebar() {
        $("#sidebar").classList.add("open");
        $("#sidebarScrim").hidden = false;
    }

    function closeSidebar() {
        $("#sidebar").classList.remove("open");
        $("#sidebarScrim").hidden = true;
    }


    function wireStatic() {

        $$("#sideNav button").forEach(button => {
            button.addEventListener("click", () => navigate(button.dataset.page));
        });

        $("#sidebarToggle").addEventListener("click", () => {
            const isOpen = $("#sidebar").classList.contains("open");
            isOpen ? closeSidebar() : openSidebar();
        });

        $("#sidebarScrim").addEventListener("click", closeSidebar);

        $("#logoutBtn").addEventListener("click", async () => {

            try {
                await supabase.auth.signOut();
            } catch (error) {
                toast("Sign out failed: " + (error.message || error), "error");
            }
        });

        $("#loginForm").addEventListener("submit", async event => {

            event.preventDefault();

            if (!supabase) {
                return;
            }

            const button = $("#loginSubmit");
            const errorBox = $("#loginError");

            button.disabled = true;
            errorBox.hidden = true;

            const email = $("#loginEmail").value.trim();
            const password = $("#loginPassword").value;

            try {

                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) {
                    throw error;
                }

                /* onAuthStateChange drives the rest. */

            } catch (error) {

                errorBox.textContent =
                    error.message === "Invalid login credentials"
                        ? "Invalid email or password."
                        : (error.message || String(error));

                errorBox.hidden = false;

            } finally {
                button.disabled = false;
            }
        });
    }


    /* ==================================================
       BOOT
    ================================================== */

    function boot() {

        if (!supabase) {

            $("#configWarning").hidden = false;
            $("#configWarning").textContent =
                "Supabase is not configured. Paste your publishable key into " +
                "js/config.js (see SETUP.md) and reload this page.";

            $("#loginSubmit").disabled = true;
            $("#syncPill").classList.add("offline");

        } else {
            $("#syncPill").classList.remove("offline");
        }

        wireStatic();

        if (supabase) {

            supabase.auth.onAuthStateChange((event, session) => {
                /* Never await inside this callback (it blocks auth). */
                setTimeout(() => handleSession(session), 0);
            });

            supabase.auth.getSession()
                .then(({ data }) => handleSession(data.session))
                .catch(error => showLogin(
                    "Session check failed: " + (error.message || error)
                ));
        }
    }


    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }

})();
