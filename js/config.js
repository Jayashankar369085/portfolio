/* ==================================================
   PUBLIC RUNTIME CONFIG
   Browser-safe values only: the Supabase URL and the
   publishable (anon) key are designed to ship to the
   client. Never put a service-role key, secret key or
   database password in this file.

   These mirror .env / .env.example — for this static
   site Vercel has no build step, so the public values
   live here (they are public by design). See SETUP.md.
================================================== */

(function () {

    "use strict";

    /* window.__ENV__ lets a future build step inject real
       environment variables without editing this file. */
    const injected =
        (typeof window.__ENV__ === "object" && window.__ENV__) || {};

    window.SITE_ENV = Object.assign({

        SUPABASE_URL:
            "https://clnqsitwiqzmikjuistr.supabase.co",

        SUPABASE_ANON_KEY:
            "sb_publishable_Zhaetb3ETAZmoLGtPHIMBw_MOEWqcN_"

    }, injected);

})();
