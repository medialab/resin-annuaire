document.addEventListener("DOMContentLoaded", function() {
    headerShrink();

    // Écouter aussi le scroll dans #section__skills-tree
    const skillsSection = document.getElementById('section__skills-tree');
    if (skillsSection) {
        skillsSection.addEventListener('scroll', headerShrink);
    }
});

window.addEventListener('scroll', headerShrink);

function headerShrink() {
    const header = document.getElementById('site-header');
    const body = document.querySelector("body");

    console.log("HEADER SCRIPT");

    if (!header) {
        console.error('Header #site-header not found');
        return;
    }

    // Vérifier le scroll de la fenêtre
    const windowScrollPosition = window.scrollY || document.documentElement.scrollTop;

    // Vérifier le scroll de #section__skills-tree
    const skillsSection = document.getElementById('section__skills-tree');
    const skillsScrollPosition = skillsSection ? skillsSection.scrollTop : 0;

    // Ajouter la classe si l'un OU l'autre a scrollé de plus de 100px
    if (windowScrollPosition > 100 || skillsScrollPosition > 100) {
        body.classList.add('is-header-shrinked');
    } else {
        body.classList.remove('is-header-shrinked');
    }
}
