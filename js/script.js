/* ==================================================
   TYPING ANIMATION
================================================== */

const roles = [
    "Software Developer",
    "Web Developer",
    "Flutter Developer",
    "AI/ML Enthusiast"
];

const typingText = document.getElementById("typingText");

let roleIndex = 0;
let characterIndex = 0;
let deleting = false;


function typeEffect() {

    if (!typingText) {
        return;
    }

    const currentRole = roles[roleIndex];

    if (!deleting) {

        typingText.textContent =
            currentRole.substring(0, characterIndex + 1);

        characterIndex++;

        if (characterIndex === currentRole.length) {

            deleting = true;

            setTimeout(typeEffect, 1500);

            return;
        }

    } else {

        typingText.textContent =
            currentRole.substring(0, characterIndex - 1);

        characterIndex--;

        if (characterIndex === 0) {

            deleting = false;

            roleIndex =
                (roleIndex + 1) % roles.length;
        }
    }

    setTimeout(
        typeEffect,
        deleting ? 50 : 90
    );
}


typeEffect();


/* ==================================================
   AUTOMATIC IMAGE EXTENSION DETECTION
================================================== */

const supportedImageExtensions = [
    ".jpeg",
    ".jpg",
    ".png"
];


const automaticImages =
    document.querySelectorAll(".auto-image");


function loadImageWithExtension(imageElement) {

    const basePath = imageElement.dataset.src;

    if (!basePath) {
        return;
    }

    let extensionIndex = 0;


    function tryNextExtension() {

        if (
            extensionIndex >=
            supportedImageExtensions.length
        ) {

            console.warn(
                `No image found for: ${basePath}`
            );

            imageElement.classList.add(
                "image-not-found"
            );

            imageElement.removeAttribute("src");

            return;
        }

        imageElement.src =
            basePath +
            supportedImageExtensions[extensionIndex];

        extensionIndex++;
    }


    imageElement.addEventListener(
        "error",
        tryNextExtension
    );


    imageElement.addEventListener(
        "load",
        () => {

            imageElement.classList.remove(
                "image-not-found"
            );

            imageElement.classList.add(
                "image-loaded"
            );
        }
    );


    tryNextExtension();
}


automaticImages.forEach(image => {

    loadImageWithExtension(image);

});


/* ==================================================
   THEME TOGGLE
================================================== */

const themeToggle =
    document.getElementById("themeToggle");


const themeIcon =
    themeToggle
        ? themeToggle.querySelector("i")
        : null;


function updateThemeIcon() {

    if (!themeIcon) {
        return;
    }

    const lightMode =
        document.body.classList.contains(
            "light-theme"
        );

    themeIcon.className =
        lightMode
            ? "bi bi-sun-fill"
            : "bi bi-moon-fill";
}


const savedTheme =
    localStorage.getItem("portfolio-theme");


if (savedTheme === "light") {

    document.body.classList.add(
        "light-theme"
    );
}


updateThemeIcon();


if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "light-theme"
            );

            const lightMode =
                document.body.classList.contains(
                    "light-theme"
                );

            localStorage.setItem(
                "portfolio-theme",
                lightMode ? "light" : "dark"
            );

            updateThemeIcon();
        }
    );
}


/* ==================================================
   PROJECT FILTER
================================================== */

const filterButtons =
    document.querySelectorAll(".filter-btn");


const projectItems =
    document.querySelectorAll(".project-item");


filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterButtons.forEach(btn => {

            btn.classList.remove("active");

        });

        button.classList.add("active");

        const selectedCategory =
            button.dataset.filter;

        projectItems.forEach(project => {

            const projectCategory =
                project.dataset.category;

            if (
                selectedCategory === "all" ||
                selectedCategory === projectCategory
            ) {

                project.classList.remove("hide");

            } else {

                project.classList.add("hide");

            }
        });
    });
});


/* ==================================================
   CLOSE MOBILE NAVBAR
================================================== */

const navbarMenu =
    document.getElementById("navbarMenu");


const navLinks =
    document.querySelectorAll(
        "#navbarMenu .nav-link"
    );


navLinks.forEach(link => {

    link.addEventListener("click", () => {

        if (
            window.innerWidth < 992 &&
            navbarMenu &&
            navbarMenu.classList.contains("show")
        ) {

            const navbarCollapse =
                bootstrap.Collapse
                    .getOrCreateInstance(navbarMenu);

            navbarCollapse.hide();
        }
    });
});


/* ==================================================
   FULL SCREEN PROJECT IMAGE LIGHTBOX
================================================== */

const imageLightbox =
    document.getElementById("imageLightbox");

const lightboxImage =
    document.getElementById("lightboxImage");

const lightboxCaption =
    document.getElementById("lightboxCaption");

const lightboxCounter =
    document.getElementById("lightboxCounter");

const lightboxClose =
    document.getElementById("lightboxClose");

const lightboxPrevious =
    document.getElementById("lightboxPrevious");

const lightboxNext =
    document.getElementById("lightboxNext");


let currentGalleryImages = [];
let currentImageIndex = 0;


function getGalleryImages(clickedImage) {

    const projectGallery =
        clickedImage.closest(".project-gallery");

    if (!projectGallery) {
        return [clickedImage];
    }

    return Array.from(

        projectGallery.querySelectorAll(
            ".gallery-image.image-loaded"
        )

    );
}


function showLightboxImage() {

    if (
        !lightboxImage ||
        currentGalleryImages.length === 0
    ) {
        return;
    }

    const selectedImage =
        currentGalleryImages[currentImageIndex];

    lightboxImage.src =
        selectedImage.src;

    lightboxImage.alt =
        selectedImage.alt ||
        "Project screenshot";

    lightboxCaption.textContent =
        selectedImage.alt || "";

    lightboxCounter.textContent =
        `${currentImageIndex + 1} / ${currentGalleryImages.length}`;

    const multipleImages =
        currentGalleryImages.length > 1;

    lightboxPrevious.style.display =
        multipleImages
            ? "flex"
            : "none";

    lightboxNext.style.display =
        multipleImages
            ? "flex"
            : "none";
}


function openLightbox(clickedImage) {

    if (!imageLightbox) {
        return;
    }

    currentGalleryImages =
        getGalleryImages(clickedImage);

    currentImageIndex =
        currentGalleryImages.indexOf(
            clickedImage
        );

    if (currentImageIndex < 0) {
        currentImageIndex = 0;
    }

    showLightboxImage();

    imageLightbox.classList.add("active");

    imageLightbox.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "lightbox-open"
    );
}


function closeLightbox() {

    if (!imageLightbox) {
        return;
    }

    imageLightbox.classList.remove("active");

    imageLightbox.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "lightbox-open"
    );

    if (lightboxImage) {
        lightboxImage.src = "";
    }
}


function showPreviousImage() {

    if (
        currentGalleryImages.length === 0
    ) {
        return;
    }

    currentImageIndex =
        (
            currentImageIndex -
            1 +
            currentGalleryImages.length
        )
        %
        currentGalleryImages.length;

    showLightboxImage();
}


function showNextImage() {

    if (
        currentGalleryImages.length === 0
    ) {
        return;
    }

    currentImageIndex =
        (
            currentImageIndex +
            1
        )
        %
        currentGalleryImages.length;

    showLightboxImage();
}


/* GALLERY IMAGE CLICK */

document.addEventListener(
    "click",
    event => {

        const clickedImage =
            event.target.closest(
                ".gallery-image"
            );

        if (
            clickedImage &&
            clickedImage.classList.contains(
                "image-loaded"
            )
        ) {

            openLightbox(clickedImage);
        }
    }
);


/* CLOSE BUTTON */

if (lightboxClose) {

    lightboxClose.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            closeLightbox();
        }
    );
}


/* PREVIOUS BUTTON */

if (lightboxPrevious) {

    lightboxPrevious.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            showPreviousImage();
        }
    );
}


/* NEXT BUTTON */

if (lightboxNext) {

    lightboxNext.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            showNextImage();
        }
    );
}


/* CLICK DARK BACKGROUND TO CLOSE */

if (imageLightbox) {

    imageLightbox.addEventListener(
        "click",
        event => {

            if (
                event.target === imageLightbox ||
                event.target.classList.contains(
                    "lightbox-content"
                )
            ) {

                closeLightbox();
            }
        }
    );
}


/* KEYBOARD CONTROLS */

document.addEventListener(
    "keydown",
    event => {

        if (
            !imageLightbox ||
            !imageLightbox.classList.contains(
                "active"
            )
        ) {
            return;
        }

        if (event.key === "Escape") {

            closeLightbox();
        }

        if (event.key === "ArrowLeft") {

            showPreviousImage();
        }

        if (event.key === "ArrowRight") {

            showNextImage();
        }
    }
);