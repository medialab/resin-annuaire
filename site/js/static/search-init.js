// Point d'entrée principal du système de recherche
// Ce fichier orchestre tous les modules de recherche

import { updateSearchResultHeight, normalizeString } from './search-utils.js';
import { searchState, updateResetButtonVisibility, resetSearch } from './search-state.js';
import { loadSkillsFromTree, loadMembersData, allSkills } from './search-data.js';
import { showAutocompleteSuggestions, hideAutocompleteDropdown, selectSkillFromAutocomplete } from './search-autocomplete.js';
import { renderResearchItems, addFreeSearchTerm } from './search-tags.js';
import { filterCards } from './search-filter.js';
import { initSkillsTreeListeners } from './search-sync.js';

// Système de recherche et filtrage
document.addEventListener("DOMContentLoaded", function() {
  const researchItems = document.querySelector("#research-items");
  const researchItemsWrapper = document.querySelector("#section__research-items");
  const searchBar = document.querySelector("#searchBar");
  const autocompleteDropdown = document.querySelector("#autocomplete-dropdown");
  const sectionSearch = document.querySelector("#section__search");
  const cardsWrapper = document.querySelector(".cards-wrapper");
  const countSpan = document.querySelector("#count-members > span");
  const skillsTree = document.querySelector("#skills-tree");

  if (!researchItems || !searchBar || !cardsWrapper) return;

  // Charger la liste des compétences depuis l'arbre
  loadSkillsFromTree();

  // Initialisation
  updateResetButtonVisibility();
  updateSearchResultHeight();
  hideAutocompleteDropdown(); // Masquer le dropdown au chargement

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
});
