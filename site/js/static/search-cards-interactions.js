// Gestion des interactions sur les cartes et comportement mobile de la recherche

import { updateToggleAllButton } from './search-utils.js';

export function initCardsInteractions() {
  const researchItemsWrapper = document.querySelector("#section__research-items");
  const cardsWrapper = document.querySelector(".cards-wrapper");
  const skillsTree = document.querySelector("#skills-tree");
  const toggleResultsBtn = document.querySelector("#toggle-results");

  if (!cardsWrapper) return;

  // ======== GESTION DU BOUTON TOGGLE-RESULTS (MOBILE) ========

  // Masquer le bouton toggle-results au chargement et ajouter le gestionnaire de clic
  if (toggleResultsBtn) {
    toggleResultsBtn.style.display = "none";

    // Gestionnaire de clic pour basculer entre expanded/collapsed
    toggleResultsBtn.addEventListener("click", function(event) {
      event.preventDefault();
      event.stopPropagation();

      const whenExpanded = toggleResultsBtn.querySelector(".when-expanded");
      const whenCollapsed = toggleResultsBtn.querySelector(".when-collapsed");

      if (whenExpanded && whenCollapsed && researchItemsWrapper) {
        // Vérifier si #section__research-items a la classe .has-items
        if (researchItemsWrapper.classList.contains("has-items")) {
          const currentDisplay = window.getComputedStyle(researchItemsWrapper).display;
          const isCollapsed = currentDisplay === "none";

          // Basculer l'affichage de la section
          if (isCollapsed) {
            researchItemsWrapper.style.display = "block";
            whenExpanded.style.display = "block";
            whenCollapsed.style.display = "none";

            // Ignorer le scroll close pendant le scroll automatique
            if (typeof window.setIgnoreScrollClose === 'function') {
              window.setIgnoreScrollClose(true);
            }

            // Scroller en haut de la page
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Réactiver le scroll close 
            setTimeout(() => {
              if (typeof window.setIgnoreScrollClose === 'function') {
                window.setIgnoreScrollClose(false);
              }
              if (typeof window.resetLastScrollY === 'function') {
                window.resetLastScrollY();
              }
            }, 600);
          } else {
            researchItemsWrapper.style.display = "none";
            whenExpanded.style.display = "none";
            whenCollapsed.style.display = "block";
          }

          // Recalculer les positions des titres fixes
          if (typeof window.updateFixedPositions === 'function') {
            window.updateFixedPositions();
          }
          if (typeof window.handleHomepageScroll === 'function') {
            window.handleHomepageScroll();
          }
        }
      }
    });
  }

  // ======== GESTION DU CLIC SUR LES TAGS DES CARTES ========

  cardsWrapper.addEventListener("click", function(event) {
    const skillTag = event.target.closest(".skills-list li");
    if (skillTag) {
      event.preventDefault();
      event.stopPropagation();

      const skillId = skillTag.getAttribute("data-skill-id");
      if (!skillId) return;

      // Cocher/décocher la checkbox correspondante dans l'arbre
      if (skillsTree) {
        const checkbox = skillsTree.querySelector(`#cb-${skillId}`);
        if (checkbox) {
          // Si déjà coché, le décocher (toggle behavior)
          if (checkbox.checked) {
            checkbox.checked = false;
            checkbox.dispatchEvent(new Event("change", { bubbles: true }));
          } else {
            // Sinon, le cocher
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event("change", { bubbles: true }));

            // En version desktop, ouvrir les listes parentes
            if (window.innerWidth >= screenSmall) {
              const level2List = checkbox.closest("ul.level-2");
              if (level2List) {
                level2List.classList.remove("is-collapsed");
                level2List.classList.add("is-open");
              }
              const level1List = checkbox.closest("ul.level-1");
              if (level1List) {
                level1List.classList.remove("is-collapsed");
                level1List.classList.add("is-open");
              }
              const level3List = checkbox.closest("ul.level-3");
              if (level3List) {
                level3List.classList.remove("is-collapsed");
                level3List.classList.add("is-open");
              }

              updateToggleAllButton();
            }
          }
        }
      }

      // En mobile, afficher #section__research-items en expanded et scroller en haut
      if (window.innerWidth < screenSmall) {
        if (researchItemsWrapper) {
          researchItemsWrapper.style.display = "block";
        }

        const toggleBtn = document.querySelector("#toggle-results");
        if (toggleBtn) {
          const whenExpanded = toggleBtn.querySelector(".when-expanded");
          const whenCollapsed = toggleBtn.querySelector(".when-collapsed");
          if (whenExpanded) whenExpanded.style.display = "block";
          if (whenCollapsed) whenCollapsed.style.display = "none";
        }

        // Ignorer le scroll close pendant le scroll automatique
        if (typeof window.setIgnoreScrollClose === 'function') {
          window.setIgnoreScrollClose(true);
        }

        // Scroller en haut de la page
        window.scrollTo({ top: 0, behavior: 'smooth' });

        setTimeout(() => {
          if (typeof window.setIgnoreScrollClose === 'function') {
            window.setIgnoreScrollClose(false);
          }
          if (typeof window.resetLastScrollY === 'function') {
            window.resetLastScrollY();
          }
          if (typeof window.updateFixedPositions === 'function') {
            window.updateFixedPositions();
          }
          if (typeof window.handleHomepageScroll === 'function') {
            window.handleHomepageScroll();
          }
        }, 600);
      }
    }
  });
}

// ======== GESTION DU SCROLL POUR FERMER #section__research-items (MOBILE) ========

export function initScrollBehavior() {
  const researchItemsWrapper = document.querySelector("#section__research-items");
  const toggleResultsBtn = document.querySelector("#toggle-results");

  let lastScrollY = window.scrollY;
  let ignoreScrollClose = false;

  window.addEventListener("scroll", function() {
    // Ce comportement doit uniquement se produire en mobile
    if (window.innerWidth >= screenSmall) return;

    // Si on vient d'ouvrir la section, ignorer temporairement le scroll
    if (ignoreScrollClose) return;

    const currentScrollY = window.scrollY;
    const scrollDiff = Math.abs(currentScrollY - lastScrollY);

    // Si on scroll plus de 40px et que #section__research-items est visible
    if (scrollDiff > 40 && researchItemsWrapper && toggleResultsBtn) {
      const currentDisplay = window.getComputedStyle(researchItemsWrapper).display;

      if (currentDisplay !== "none" &&
          researchItemsWrapper.classList.contains("has-items")) {
        const whenExpanded = toggleResultsBtn.querySelector(".when-expanded");
        const whenCollapsed = toggleResultsBtn.querySelector(".when-collapsed");

        // Fermer la section
        researchItemsWrapper.style.display = "none";
        if (whenExpanded) whenExpanded.style.display = "none";
        if (whenCollapsed) whenCollapsed.style.display = "block";

        // Recalculer les positions des titres fixes
        if (typeof window.updateFixedPositions === 'function') {
          window.updateFixedPositions();
        }
        if (typeof window.handleHomepageScroll === 'function') {
          window.handleHomepageScroll();
        }
      }

      lastScrollY = currentScrollY;
    }
  }, { passive: true });

  // Exposer les fonctions pour contrôler le comportement de scroll
  window.setIgnoreScrollClose = function(value) {
    ignoreScrollClose = value;
  };

  window.resetLastScrollY = function() {
    lastScrollY = window.scrollY;
  };
}
