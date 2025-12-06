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

  // Charger les données des membres au démarrage pour l'autocomplétion
  loadMembersData();

  // Initialiser les listeners pour l'arbre de compétences
  initSkillsTreeListeners();

  // Attacher l'événement click au bouton reset
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
    });

    // Fermer le dropdown si on clique ailleurs
    document.addEventListener("click", function(event) {
      if (!searchBar.contains(event.target) && !autocompleteDropdown.contains(event.target)) {
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

    // Marquer qu'on a utilisé la barre de recherche
    searchState.usedAutocomplete = true;

    // Vérifier si c'est une compétence existante
    const normalizedQuery = normalizeString(query);
    const matchingSkill = allSkills.find(skill =>
      normalizeString(skill.label) === normalizedQuery
    );

    if (matchingSkill) {
      // C'est une compétence ’ la sélectionner via l'autocomplétion
      selectSkillFromAutocomplete(matchingSkill);
    } else {
      // Ce n'est pas une compétence ’ ajouter comme recherche libre
      addFreeSearchTerm(query, true);
      searchBar.value = "";
      hideAutocompleteDropdown();
    }
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
