// Script générique pour gérer les TOC (Table of Contents)
document.querySelectorAll('.page-toc').forEach((toc) => {
  const tocLinks = toc.querySelectorAll('li');


  // Gérer la hauteur sticky au chargement
  toc.style.marginBottom = `-${toc.offsetHeight}px`;
  const nextElement = toc.nextElementSibling;
  if (nextElement) {
    nextElement.style.marginTop = `calc(var(--spacing)*5)`;
  }

  // Récupérer tous les liens du TOC et leurs sections correspondantes
  const sections = Array.from(tocLinks)
    .map((li) => {
      const link = li.querySelector('a');
      if (!link) return null;

      const targetId = link.getAttribute('href')?.substring(1);
      const element = targetId ? document.getElementById(targetId) : null;

      return element ? { element, tocItem: li } : null;
    })
    .filter(Boolean);

  // Mettre à jour la section active basée sur le scroll
  function updateActiveSection() {
    const offset = 160;
    let activeSection = null;

    // Trouver la dernière section visible
    sections.forEach((section) => {
      if (section.element.getBoundingClientRect().top <= offset) {
        activeSection = section;
      }
    });

    // Appliquer la classe is-selected
    tocLinks.forEach((li) => li.classList.remove('is-selected'));
    if (activeSection) {
      activeSection.tocItem.classList.add('is-selected');
    }
  }

  // Gestion du clic sur les liens
  tocLinks.forEach((li) => {
    const link = li.querySelector('a');
    if (!link) return;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href')?.substring(1);
      const target = targetId ? document.getElementById(targetId) : null;

      if (target) {
        const headerHeight = parseInt(getComputedStyle(document.body).getPropertyValue('--header-h')) || 0;
        window.scrollTo({
          top: target.offsetTop,
          behavior: 'smooth'
        });
      }

      // Fermer le menu mobile si ouvert
      const menuToggle = document.getElementById('input-toggle-menu');
      if (menuToggle?.checked) {
        menuToggle.checked = false;
      }
    });
  });

  // Écouter le scroll
  window.addEventListener('scroll', updateActiveSection, { passive: true });
  updateActiveSection();
});
