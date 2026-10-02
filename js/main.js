/* ==================================================
   MAIN ENTRY
   Boot order: preloader gates visibility, then every
   module initializes. Modules are independent and
   fail-soft: one broken section never blocks others.
================================================== */

(function () {

    "use strict";

    Preloader.play();

    function boot() {

        /* Order matters: Skills renders its cards first, then
           Reveal attaches observers to everything. ProjectDetails
           builds its overlay before Cursor so overlay buttons can
           be magnetized. */
        const modules = [
            Content,
            Nav,
            Hero,
            ProjectDetails,
            BeyondFX,
            Cursor,
            ProjectFX,
            Skills,
            Reveal,
            EasterEggs,
            Contact
        ];

        modules.forEach(module => {

            try {

                if (module && typeof module.init === "function") {
                    module.init();
                }

            } catch (error) {
                console.error(`Module failed to initialize:`, error);
            }
        });
    }


    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})();
