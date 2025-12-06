// Point d'entr�e principal du syst�me de recherche
// Ce fichier orchestre tous les modules de recherche

import { updateSearchResultHeight, normalizeString } from './search-utils.js';
import { searchState, updateResetButtonVisibility, resetSearch } from './search-state.js';
import { loadSkillsFromTree, loadMembersData, allSkills } from './search-data.js';
import { showAutocompleteSuggestions, hideAutocompleteDropdown, selectSkillFromAutocomplete } from './search-autocomplete.js';
import { renderResearchItems, addFreeSearchTerm } from './search-tags.js';
import { filterCards } from './search-filter.js';
import { initSkillsTreeListeners } from './search-sync.js';

// Syst�me de recherche et filtrage
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

  // Charger la liste des comp�tences depuis l'arbre
  loadSkillsFromTree();

  // Initialisation
  updateResetButtonVisibility();
  updateSearchResultHeight();
  hideAutocompleteDropdown(); // Masquer le dropdown au chargement

  // Charger les donn�es des membres au d�marrage pour l'autocompl�tion
  loadMembersData();

  // Initialiser les listeners pour l'arbre de comp�tences
  initSkillsTreeListeners();

  // Attacher l'�v�nement click au bouton reset
  const resetBtn = document.querySelector("#reset-search");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetSearch);
  }

  // ======== EVENT LISTENERS AUTOCOMPL�TION ========

  // �couter l'input dans la barre de recherche
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

    // Fermer le dropdown avec la touche Escape ou g�rer Enter pour recherche libre
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

  // G�rer la soumission de la recherche (Enter)
  function handleSearchSubmit() {
    const query = searchBar.value.trim();

    if (query === "") return;

    // Marquer qu'on a utilis� la barre de recherche
    searchState.usedAutocomplete = true;

    // V�rifier si c'est une comp�tence existante
    const normalizedQuery = normalizeString(query);
    const matchingSkill = allSkills.find(skill =>
      normalizeString(skill.label) === normalizedQuery
    );

    if (matchingSkill) {
      // C'est une comp�tence � la s�lectionner via l'autocompl�tion
      selectSkillFromAutocomplete(matchingSkill);
    } else {
      // Ce n'est pas une comp�tence � ajouter comme recherche libre
      addFreeSearchTerm(query, true);
      searchBar.value = "";
      hideAutocompleteDropdown();
    }

    // Masquer le bouton de recherche apr�s soumission
    const btnSearch = document.querySelector("#btn-search");
    if (btnSearch) {
      btnSearch.style.display = "none";
    }
  }

  // ======== GESTION DU CLIC SUR L'IC�NE DE RECHERCHE ========

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
