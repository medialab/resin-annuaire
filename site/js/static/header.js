document.addEventListener("DOMContentLoaded", function() {
    headerShrink();

    const skillsSection = document.getElementById('section__skills-tree');
    if (skillsSection) {
        skillsSection.addEventListener('scroll', headerShrink);
    }
});

window.addEventListener('scroll', headerShrink);

function headerShrink() {
    const header = document.getElementById('site-header');
    const body = document.querySelector("body");

    if (!header) {
        console.error('Header #site-header not found');
        return;
    }

    const windowScrollPosition = window.scrollY || document.documentElement.scrollTop;

    const skillsSection = document.getElementById('section__skills-tree');
    const skillsScrollPosition = skillsSection ? skillsSection.scrollTop : 0;

    // Ajoute la classe dès qu'un des deux scrolls > 100px
    if (window.innerWidth >= screenSmall
        && (windowScrollPosition > 100 || skillsScrollPosition > 100)
        && !body.classList.contains('is-header-shrinked')
    ) {
        body.classList.add('is-header-shrinked');
    }
}



// Responsive

const screenSmall = 920;
const screenPhone = 560;