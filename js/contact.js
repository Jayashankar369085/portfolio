/* ==================================================
   CONTACT MICRO-INTERACTIONS
   Copy-to-clipboard email chip with feedback state
   and a fallback for non-secure contexts.
================================================== */

const Contact = (() => {

    function flashCopied(button, labelElement, iconElement) {

        button.classList.add("copied");

        const originalText = labelElement.textContent;
        const originalIcon = iconElement.className;

        labelElement.textContent = "Copied! ✓";
        iconElement.className = "bi bi-check-lg";

        setTimeout(() => {

            button.classList.remove("copied");
            labelElement.textContent = originalText;
            iconElement.className = originalIcon;

        }, 2000);
    }


    function legacyCopy(text) {

        const textarea = document.createElement("textarea");

        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);
        textarea.select();

        let succeeded = false;

        try {
            succeeded = document.execCommand("copy");
        } catch (error) {
            succeeded = false;
        }

        document.body.removeChild(textarea);

        return succeeded;
    }


    function init() {

        const button = document.getElementById("copyEmail");

        if (!button) {
            return;
        }

        const labelElement =
            document.getElementById("copyEmailText");

        const iconElement =
            document.getElementById("copyEmailIcon");

        const email =
            labelElement
                ? labelElement.textContent.trim()
                : "jayashankaryt14@gmail.com";


        button.addEventListener("click", async () => {

            let copied = false;

            try {

                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(email);
                    copied = true;
                }

            } catch (error) {
                copied = false;
            }

            if (!copied) {
                copied = legacyCopy(email);
            }

            if (copied && labelElement && iconElement) {
                flashCopied(button, labelElement, iconElement);
            }
        });
    }


    return { init };
})();
