// Système d'autocomplétion de la recherche

import { normalizeString } from './search-utils.js';
import { allSkills, freeSearchSuggestions } from './search-data.js';
import { searchState } from './search-state.js';

// Afficher les suggestions d'autocomplétion
export function showAutocompleteSuggestions(query) {
  const autocompleteDropdown = document.querySelector("#autocomplete-dropdown");
  if (!autocompleteDropdown) return;

  // Normaliser la recherche
  const normalizedQuery = normalizeString(query);

  // Filtrer les compétences qui matchent
  const skillMatches = allSkills.filter(skill => {
    const normalizedLabel = normalizeString(skill.label);
    return normalizedLabel.includes(normalizedQuery);
  }).slice(0, 8); // Limiter à 8 compétences

  // Filtrer les suggestions libres qui matchent (commence par)
  const freeMatches = freeSearchSuggestions.filter(suggestion => {
    const normalizedSuggestion = normalizeString(suggestion);
    return normalizedSuggestion.startsWith(normalizedQuery);
  }).slice(0, 8); // Limiter à 8 suggestions

  // Si recherche vide, masquer le dropdown
  if (query.trim() === "") {
    autocompleteDropdown.innerHTML = "";
    autocompleteDropdown.style.display = "none";
    return;
  }

  // Si aucune suggestion, masquer le dropdown
  if (skillMatches.length === 0 && freeMatches.length === 0) {
    autocompleteDropdown.innerHTML = "";
    autocompleteDropdown.style.display = "none";
    return;
  }

  // Afficher les suggestions
  autocompleteDropdown.innerHTML = "";

  // Section Compétences
  if (skillMatches.length > 0) {
    const skillsTitle = document.createElement("div");
    skillsTitle.className = "autocomplete-title";
    skillsTitle.textContent = "Compétences";
    autocompleteDropdown.appendChild(skillsTitle);

    const skillsContainer = document.createElement("div");
    skillsContainer.className = "autocomplete-skills-container";

    skillMatches.forEach(skill => {
      const item = document.createElement("div");
      item.className = "autocomplete-item";
      item.setAttribute("data-skill-id", skill.id);
      item.setAttribute("data-field", skill.field);
      item.textContent = skill.label;

      item.addEventListener("click", () => selectSkillFromAutocomplete(skill));

      skillsContainer.appendChild(item);
    });

    autocompleteDropdown.appendChild(skillsContainer);
  }

  // Section Suggestions (recherche libre)
  if (freeMatches.length > 0) {
    const suggestionsTitle = document.createElement("div");
    suggestionsTitle.className = "autocomplete-title";
    suggestionsTitle.textContent = "Suggestions";
    autocompleteDropdown.appendChild(suggestionsTitle);

    const suggestionsContainer = document.createElement("div");
    suggestionsContainer.className = "autocomplete-suggestions-container";

    // Ajouter les suggestions matchantes
    freeMatches.forEach(suggestion => {
      const item = document.createElement("div");
      item.className = "autocomplete-item autocomplete-item--free";
      item.textContent = suggestion;

      item.addEventListener("click", () => {
        import('./search-tags.js').then(({ addFreeSearchTerm }) => {
          const searchBar = document.querySelector("#searchBar");
          addFreeSearchTerm(suggestion, true);
          if (searchBar) searchBar.value = "";
          hideAutocompleteDropdown();
        });
      });

      suggestionsContainer.appendChild(item);
    });

    autocompleteDropdown.appendChild(suggestionsContainer);
  }

  autocompleteDropdown.style.display = "block";
}

// Sélectionner une compétence depuis l'autocomplétion
export function selectSkillFromAutocomplete(skill) {
  // Marquer qu'on a utilisé l'autocomplétion
  searchState.usedAutocomplete = true;

  // Cocher la checkbox correspondante dans l'arbre
  const skillsTree = document.querySelector("#skills-tree");
  if (skillsTree) {
    const checkbox = skillsTree.querySelector(`#cb-${skill.id}`);
    if (checkbox && !checkbox.checked) {
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  // Vider le champ de recherche
  const searchBar = document.querySelector("#searchBar");
  if (searchBar) {
    searchBar.value = "";
  }

  // Masquer le bouton de recherche
  const btnSearch = document.querySelector("#btn-search");
  if (btnSearch) {
    btnSearch.style.display = "none";
  }

  // Masquer le dropdown
  hideAutocompleteDropdown();

  // En mobile, afficher #section__research-items en expanded
  if (window.innerWidth < screenSmall) {
    const researchItemsWrapper = document.querySelector("#section__research-items");
    const toggleBtn = document.querySelector("#toggle-results");

    if (researchItemsWrapper) {
      researchItemsWrapper.style.display = "block";
    }

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
  }

  // Remonter en haut de la page
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // En mobile, réactiver le scroll close après le scroll
  if (window.innerWidth < screenSmall) {
    setTimeout(() => {
      if (typeof window.setIgnoreScrollClose === 'function') {
        window.setIgnoreScrollClose(false);
      }
      if (typeof window.resetLastScrollY === 'function') {
        window.resetLastScrollY();
      }
    }, 600);
  }
}

// Masquer le dropdown d'autocomplétion
export function hideAutocompleteDropdown() {
  const autocompleteDropdown = document.querySelector("#autocomplete-dropdown");
  if (autocompleteDropdown) {
    autocompleteDropdown.innerHTML = "";
    autocompleteDropdown.style.display = "none";
  }
}
