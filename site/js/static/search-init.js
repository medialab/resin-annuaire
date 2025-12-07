// Point d'entrée principal du système de recherche
// Ce fichier orchestre tous les modules de recherche

import { updateSearchResultHeight, normalizeString, updateToggleAllButton } from './search-utils.js';
import { searchState, updateResetButtonVisibility, resetSearch } from './search-state.js';
import { loadSkillsFromTree, loadMembersData, allSkills } from './search-data.js';
import { showAutocompleteSuggestions, hideAutocompleteDropdown, selectSkillFromAutocomplete } from './search-autocomplete.js';
import { renderResearchItems, addFreeSearchTerm } from './search-tags.js';
import { filterCards } from './search-filter.js';
import { initSkillsTreeListeners } from './search-sync.js';

// Système de recherche et filtrage
document.addEventListener("DOMContentLoaded", function() {
  const researchItemsWrapper = document.querySelector("#section__research-items");
  const searchBar = document.querySelector("#searchBar");
  const autocompleteDropdown = document.querySelector("#autocomplete-dropdown");
  const sectionSearch = document.querySelector("#section__search");
  const cardsWrapper = document.querySelector(".cards-wrapper");
  const countSpan = document.querySelector("#count-members > span");
  const skillsTree = document.querySelector("#skills-tree");

  if (!researchItemsWrapper || !searchBar || !cardsWrapper) return;

  // Charger la liste des compétences depuis l'arbre
  loadSkillsFromTree();

  // Initialisation
  updateResetButtonVisibility();
  updateSearchResultHeight();
  hideAutocompleteDropdown(); // Masquer le dropdown au chargement

  // Masquer le bouton toggle-results au chargement et ajouter le gestionnaire de clic
  const toggleResultsBtn = document.querySelector("#toggle-results");
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
          // Vérifier l'état actuel avec getComputedStyle
          const currentDisplay = window.getComputedStyle(researchItemsWrapper).display;
          const isCollapsed = currentDisplay === "none";

          // Basculer l'affichage de la section
          if (isCollapsed) {
            // On ouvre la section
            researchItemsWrapper.style.display = "block";
            whenExpanded.style.display = "block";
            whenCollapsed.style.display = "none";

            // Ignorer le scroll close pendant le scroll automatique
            if (typeof window.setIgnoreScrollClose === 'function') {
              window.setIgnoreScrollClose(true);
            }

            // Scroller en haut de la page
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Réactiver le scroll close après l'animation et réinitialiser lastScrollY
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

  loadMembersData();
  initSkillsTreeListeners();

  const resetBtn = document.querySelector("#reset-search");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetSearch);
  }

  // ======== EVENT LISTENERS AUTOCOMPLÉTION ========

  // Écouter l'input dans la barre de recherche
  if (searchBar && autocompleteDropdown) {
    searchBar.addEventListener("input", function(event) {
      const query = event.target.value;
      showAutocompleteSuggestions(query);

      // Afficher/masquer le bouton de recherche selon la longueur
      const btnSearch = document.querySelector("#btn-search");
      if (btnSearch) {
        if (query.length >= 3) {
          btnSearch.style.display = "flex";
        } else {
          btnSearch.style.display = "none";
        }
      }
    });

    // Fermer le dropdown si on clique ailleurs
    document.addEventListener("click", function(event) {
      const btnSearch = document.querySelector("#btn-search");
      const searchIcon = document.querySelector("#search-icon");

      // Ne pas fermer si on clique sur la barre, le dropdown, le bouton de recherche ou l'icône
      if (!searchBar.contains(event.target) &&
          !autocompleteDropdown.contains(event.target) &&
          !(btnSearch && btnSearch.contains(event.target)) &&
          !(searchIcon && searchIcon.contains(event.target))) {
        hideAutocompleteDropdown();
      }
    });

    // Fermer le dropdown avec la touche Escape ou gérer Enter pour recherche libre
    searchBar.addEventListener("keydown", function(event) {
      if (event.key === "Escape") {
        hideAutocompleteDropdown();
        searchBar.blur();
      } else if (event.key === "Enter") {
        event.preventDefault();
        handleSearchSubmit();
      }
    });
  }

  // Gérer la soumission de la recherche (Enter)
  function handleSearchSubmit() {
    const query = searchBar.value.trim();

    if (query === "") return;

    searchState.usedAutocomplete = true;

    // Vérifier si c'est une compétence existante
    const normalizedQuery = normalizeString(query);
    const matchingSkill = allSkills.find(skill =>
      normalizeString(skill.label) === normalizedQuery
    );

    if (matchingSkill) {
      selectSkillFromAutocomplete(matchingSkill);
    } else {
      addFreeSearchTerm(query, true);
      searchBar.value = "";
      hideAutocompleteDropdown();
    }

    const btnSearch = document.querySelector("#btn-search");
    if (btnSearch) {
      btnSearch.style.display = "none";
    }
  }

  // ======== GESTION DU CLIC SUR L'ICÔNE DE RECHERCHE ========

  const searchIcon = document.querySelector("#search-icon");
  if (searchIcon) {
    searchIcon.addEventListener("click", function() {
      handleSearchSubmit();
    });
  }

  // ======== GESTION DU CLIC SUR LE BOUTON DE RECHERCHE ========

  const btnSearch = document.querySelector("#btn-search");
  if (btnSearch) {
    btnSearch.addEventListener("click", function(event) {
      event.preventDefault();
      event.stopPropagation();
      handleSearchSubmit();
    });
  }

  // ======== GESTION DU FOCUS SUR LA BARRE DE RECHERCHE ========

  if (searchBar && sectionSearch) {
    searchBar.addEventListener("focus", function() {
      sectionSearch.classList.add("is-focus");
    });

    searchBar.addEventListener("blur", function() {
      sectionSearch.classList.remove("is-focus");
    });
  }

  // ======== GESTION DU CLIC SUR LES TAGS DES CARTES ========

  if (cardsWrapper) {
    cardsWrapper.addEventListener("click", function(event) {
      // Vérifier si on a cliqué sur un tag de compétence
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
                // Trouver la liste level-2 parente
                const level2List = checkbox.closest("ul.level-2");
                if (level2List) {
                  level2List.classList.remove("is-collapsed");
                  level2List.classList.add("is-open");
                }

                // Trouver la liste level-1 parente
                const level1List = checkbox.closest("ul.level-1");
                if (level1List) {
                  level1List.classList.remove("is-collapsed");
                  level1List.classList.add("is-open");
                }

                // Trouver la liste level-3 parente si elle existe
                const level3List = checkbox.closest("ul.level-3");
                if (level3List) {
                  level3List.classList.remove("is-collapsed");
                  level3List.classList.add("is-open");
                }

                // Mettre à jour le bouton toggle-all
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

          // Réactiver le scroll close et mettre à jour les positions fixed après le scroll
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

  // ======== GESTION DU SCROLL POUR FERMER #section__research-items ========

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

  // Exposer les fonctions
  window.setIgnoreScrollClose = function(value) {
    ignoreScrollClose = value;
  };

  window.resetLastScrollY = function() {
    lastScrollY = window.scrollY;
  };
});
