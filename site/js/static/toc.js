// Script générique pour gérer les TOC (Table of Contents)

document.querySelectorAll('.page-toc').forEach((toc) => {
  const tocLinks = toc.querySelectorAll('li');
  const backToTop = toc.querySelector('.back-to-top');
  const footer = document.getElementById('site-footer');

  // Fonction pour ajuster la hauteur sticky du TOC
  function adjustTocHeight() {
    toc.style.marginBottom = `-${toc.offsetHeight}px`;
    const nextElement = toc.nextElementSibling;
    if (nextElement) {
      nextElement.style.marginTop = `calc(var(--spacing)*5)`;
    }
  }

  // Fonction pour faire disparaître .back-to-top quand le footer approche (desktop uniquement)
  function adjustBackToTopVisibility() {
    if (!backToTop || !footer) {
      return;
    }

    // Sur mobile, toujours visible
    if (window.innerWidth <= 820) {
      backToTop.style.display = '';
      return;
    }

    const spacing = parseInt(getComputedStyle(document.body).getPropertyValue('--spacing')) || 0;
    const footerOffset = spacing * 8; // Commencer var(--spacing)*8 avant le footer

    const footerRect = footer.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Si le footer approche (avec l'offset), cacher le bouton
    if (footerRect.top - footerOffset < windowHeight) {
      backToTop.style.display = 'none';
    } else {
      backToTop.style.display = '';
    }
  }

  // Initialiser au chargement
  adjustTocHeight();
  adjustBackToTopVisibility();

  // Recalculer au resize
  window.addEventListener('resize', () => {
    adjustTocHeight();
    adjustBackToTopVisibility();
  });

  // Ajuster au scroll
  window.addEventListener('scroll', adjustBackToTopVisibility, { passive: true });

  // Copier le TOC dans le menu mobile
  const inputToggleMenu = document.getElementById('input-toggle-menu');
  const siteNav = document.getElementById('site-nav');

  if (inputToggleMenu && siteNav) {
    inputToggleMenu.addEventListener('change', function() {
      // Si la checkbox est cochée (menu ouvert)
      if (this.checked) {
        // Vérifier si .page-toc n'existe pas déjà dans #site-nav
        const existingToc = siteNav.querySelector('.page-toc');

        if (!existingToc) {
          // Récupérer le titre de la page
          const mainContainer = document.querySelector('.main--container');
          const pageTitle = mainContainer ? mainContainer.querySelector('h2') : null;

          // Créer et ajouter le h2.title-nav
          if (pageTitle) {
            const titleNav = document.createElement('h2');
            titleNav.className = 'title-nav';
            titleNav.textContent = pageTitle.textContent;
            siteNav.appendChild(titleNav);
          }

          // Cloner et ajouter le TOC
          const tocClone = toc.cloneNode(true);
          siteNav.appendChild(tocClone);

          // Ajouter les event listeners aux liens du TOC cloné
          const clonedLinks = tocClone.querySelectorAll('li');
          clonedLinks.forEach((li) => {
            const link = li.querySelector('a');
            if (link) {
              link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href')?.substring(1);
                const target = targetId ? document.getElementById(targetId) : null;

                if (target) {
                  const headerHeight = parseInt(getComputedStyle(document.body).getPropertyValue('--header-h')) || 0;
                  window.scrollTo({
                    top: target.offsetTop - headerHeight,
                    behavior: 'smooth'
                  });
                }

                // Décocher la checkbox pour fermer le menu
                if (inputToggleMenu.checked) {
                  inputToggleMenu.checked = false;
                }
              });
            }
          });
        }
      }
    });
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
