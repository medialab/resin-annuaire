// Responsive breakpoints
const screenSmall = 820;
const screenPhone = 560;


// Fonction pour gérer le header shrink au scroll
function headerShrink() {
    const header = document.getElementById('site-header');
    const body = document.body;

    if (!header) {
        console.error('Header #site-header not found');
        return;
    }

    const windowScrollPosition = window.scrollY || document.documentElement.scrollTop;

    const skillsSection = document.getElementById('section__skills-tree');
    const skillsScrollPosition = skillsSection ? skillsSection.scrollTop : 0;

    // Ajoute la classe dès qu'un des deux scrolls > 60px (desktop uniquement)
    if (window.innerWidth >= screenSmall
        && (windowScrollPosition > 60 || skillsScrollPosition > 60)
        && !body.classList.contains('is-header-shrinked')
    ) {
        body.classList.add('is-header-shrinked');
    }
}


// Fonction pour gérer le subheader au scroll (mobile uniquement)
function handleSubheaderScroll() {
  const scrollY = window.scrollY;
  const body = document.body;

  if (window.innerWidth < screenSmall) {
    if (scrollY > 200) {
      if (!body.classList.contains('has-subheader')) {
        body.classList.add('has-subheader');
      }
    } else {
      if (body.classList.contains('has-subheader')) {
        body.classList.remove('has-subheader');
      }
    }
  } else {
    // Sur grand écran, retirer la classe si elle existe
    if (body.classList.contains('has-subheader')) {
      body.classList.remove('has-subheader');
    }
  }
}


// Fonction combinée appelée au scroll
function handleScroll() {
  headerShrink();
  handleSubheaderScroll();
}


// Event listeners
document.addEventListener("DOMContentLoaded", function() {
    headerShrink();
    handleSubheaderScroll();

    const skillsSection = document.getElementById('section__skills-tree');
    if (skillsSection) {
        skillsSection.addEventListener('scroll', headerShrink);
    }
});

window.addEventListener('scroll', handleScroll, { passive: true });
window.addEventListener('resize', handleSubheaderScroll);
