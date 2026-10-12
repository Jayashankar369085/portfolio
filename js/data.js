/* ==================================================
   PORTFOLIO DATA LAYER
   Reads all manageable content from Supabase (RLS
   exposes only published rows). Every section falls
   back to the static markup already in index.html when
   Supabase is unconfigured, unreachable or erroring, so
   the page never breaks.

   One fetch per page load — no polling.
================================================== */

const PortfolioData = (() => {

    const CONTENT_TABLES = [
        "projects",
        "experiences",
        "highlights",
        "achievements",
        "skills",
        "social_links"
    ];

    const PUBLIC_BUCKET = "certificates-public";
    const PRIVATE_BUCKET = "certificates-private";

    let request = null;


    /* ---------- Configuration ---------- */

    function config() {
        return window.SITE_ENV || {};
    }

    function isConfigured() {

        const url = config().SUPABASE_URL;
        const key = config().SUPABASE_ANON_KEY;

        return Boolean(
            url &&
            key &&
            !/^PASTE_/i.test(key) &&
            !/^https?:\/\/$/.test(url)
        );
    }

    function client() {

        if (!isConfigured()) {
            return null;
        }

        if (!window.supabase || typeof window.supabase.createClient !== "function") {
            return null;
        }

        return window.supabase.createClient(
            config().SUPABASE_URL,
            config().SUPABASE_ANON_KEY,
            { auth: { persistSession: false, autoRefreshToken: false } }
        );
    }


    /* ---------- Fetching ---------- */

    function fetchTable(supabase, table) {

        return supabase
            .from(table)
            .select("*")
            .order("sort_order", { ascending: true })
            .then(result => ({ table, rows: result.data, error: result.error }));
    }


    function fetchSettings(supabase) {

        return supabase
            .from("site_settings")
            .select("key, value")
            .then(result => {

                const map = {};

                if (!result.error && Array.isArray(result.data)) {
                    result.data.forEach(row => {
                        map[row.key] = row.value;
                    });
                }

                return { table: "site_settings", rows: map, error: result.error };
            });
    }


    function load() {

        const supabase = client();

        if (!supabase) {
            return Promise.resolve({ ok: false, reason: "not-configured", sections: {} });
        }

        const queries =
            CONTENT_TABLES.map(table => fetchTable(supabase, table))
                .concat([fetchSettings(supabase)]);

        return Promise.all(queries)
            .then(results => {

                const sections = {};
                let anyOk = false;

                results.forEach(result => {

                    const ok = !result.error;

                    if (ok) {
                        anyOk = true;
                    }

                    sections[result.table] = {
                        ok,
                        rows: result.rows || [],
                        error: result.error || null
                    };
                });

                return { ok: anyOk, reason: anyOk ? "loaded" : "error", sections };
            })
            .catch(error => ({
                ok: false,
                reason: "error",
                error,
                sections: {}
            }));
    }


    /* ---------- Lifecycle ---------- */

    function init() {

        if (!request) {
            request = load();
        }

        return request;
    }

    function ready() {

        if (!request) {
            init();
        }

        return request;
    }


    /* ---------- File helpers ----------
       certificate_path values may be:
         - https://...                      (absolute URL)
         - certificates-public/<path>       (published storage object)
         - certificates-private/<path>      (never public)
         - assets/...                       (file shipped with the site)
    */

    function fileUrl(path) {

        if (!path) {
            return null;
        }

        if (/^https?:\/\//i.test(path)) {
            return path;
        }

        if (path.startsWith(PUBLIC_BUCKET + "/")) {
            return config().SUPABASE_URL +
                "/storage/v1/object/public/" + path;
        }

        if (path.startsWith(PRIVATE_BUCKET + "/")) {
            /* Only published rows reach this code (RLS), and the admin
               dashboard copies a published file into the public bucket.
               Unpublished rows stay reachable only from the private bucket. */
            return config().SUPABASE_URL +
                "/storage/v1/object/public/" +
                PUBLIC_BUCKET + "/" +
                path.slice(PRIVATE_BUCKET.length + 1);
        }

        return path;
    }


    return {
        init,
        ready,
        isConfigured,
        fileUrl,
        buckets: { public: PUBLIC_BUCKET, private: PRIVATE_BUCKET }
    };

})();
