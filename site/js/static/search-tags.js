// Gestion des tags de recherche (compétences et recherche libre)

import { updateSearchResultHeight } from './search-utils.js';
import { searchState, updateResetButtonVisibility } from './search-state.js';

// Afficher les tags dans #research-items
export function renderResearchItems() {
  const researchItems = document.querySelector("#research-items");
  const researchItemsWrapper = document.querySelector("#section__research-items");

  if (!researchItems) return;

  // Import dynamique pour éviter dépendance circulaire
  import('./search-filter.js').then(({ filterCards }) => {
    // Vider le contenu
    researchItems.innerHTML = "";

    // Créer tous les tags
    const allTags = [];

    // Ajouter les tags de compétences
    searchState.selectedSkills.forEach(skill => {
      const tag = createTag(skill.label, "skill", () => removeSkill(skill.id), skill.field, skill.id);
      allTags.push(tag);
    });

    // Ajouter les tags de recherche libre
    searchState.freeSearchTerms.forEach(term => {
      const tag = createTag(term.term, "free", () => removeFreeSearchTerm(term.term));
      allTags.push(tag);
    });

    // Ajouter les tags avec des séparateurs "ou"
    allTags.forEach((tag, index) => {
      researchItems.appendChild(tag);

      if (index < allTags.length - 1) {
        const separator = document.createElement("span");
        separator.className = "research-separator";
        separator.textContent = "ou";
        researchItems.appendChild(separator);
      }
    });

    // Gérer la classe has-items sur le wrapper (seulement si utilisé l'autocomplétion ET qu'il y a des items)
    const hasItems = searchState.selectedSkills.length > 0 || searchState.freeSearchTerms.length > 0;
    if (researchItemsWrapper) {
      if (searchState.usedAutocomplete && hasItems) {
        researchItemsWrapper.classList.add("has-items");
        // Réinitialiser le display pour qu'il soit visible par défaut quand on ajoute des items
        // (sauf en mobile où il sera géré par le bouton toggle)
        if (window.innerWidth >= screenSmall) {
          researchItemsWrapper.style.display = "";
        } else {
          // En mobile, afficher par défaut quand on ajoute des items
          researchItemsWrapper.style.display = "block";
        }
      } else {
        researchItemsWrapper.classList.remove("has-items");
        researchItemsWrapper.style.display = "";
      }
    }

    // Gérer l'affichage du bouton #toggle-results en mobile
    const toggleBtn = document.querySelector("#toggle-results");
    if (toggleBtn) {
      if (searchState.usedAutocomplete && hasItems && window.innerWidth < screenSmall) {
        toggleBtn.style.display = "flex";

        // Afficher .when-expanded et masquer .when-collapsed par défaut
        const whenExpanded = toggleBtn.querySelector(".when-expanded");
        const whenCollapsed = toggleBtn.querySelector(".when-collapsed");
        if (whenExpanded) whenExpanded.style.display = "block";
        if (whenCollapsed) whenCollapsed.style.display = "none";
      } else {
        toggleBtn.style.display = "none";
      }
    }

    // Mettre à jour la hauteur de la section après le rendu
    updateSearchResultHeight();
  });
}

function createTag(label, type, onRemove, field = null, skillId = null) {
  const tag = document.createElement("div");
  tag.className = `research-tag research-tag--${type}`;

  // Ajouter data-skill-id si disponible
  if (skillId) {
    tag.setAttribute("data-skill-id", skillId);
  }

  // Ajouter data-field si disponible
  if (field) {
    tag.setAttribute("data-field", field.toLowerCase());
  }

  const labelSpan = document.createElement("span");
  labelSpan.className = "tag-label";
  labelSpan.textContent = label;

  const removeBtn = document.createElement("button");
  removeBtn.className = "tag-remove";
  removeBtn.setAttribute("aria-label", `Retirer ${label}`);
  removeBtn.innerHTML = "&times;";
  tag.addEventListener("click", onRemove);

  tag.appendChild(labelSpan);
  tag.appendChild(removeBtn);

  return tag;
}

// Retirer une compétence
export function removeSkill(skillId) {
  import('./search-filter.js').then(({ filterCards }) => {
    searchState.selectedSkills = searchState.selectedSkills.filter(s => s.id !== skillId);

    const skillsTree = document.querySelector("#skills-tree");
    if (skillsTree) {
      const checkbox = skillsTree.querySelector(`#cb-${skillId}`);

      if (checkbox && checkbox.checked) {
        checkbox.checked = false;
        const item = checkbox.closest(".item");
        if (item) {
          item.classList.remove("is-checked");
          delete item.dataset.checkedBy;
        }
        checkbox.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }

    renderResearchItems();
    filterCards();
    updateResetButtonVisibility();
  });
}

// Retirer un terme de recherche libre
export function removeFreeSearchTerm(term) {
  import('./search-filter.js').then(({ filterCards }) => {
    searchState.freeSearchTerms = searchState.freeSearchTerms.filter(t => t.term !== term);
    renderResearchItems();
    filterCards();
    updateResetButtonVisibility();
  });
}

// Ajouter un terme de recherche libre
export function addFreeSearchTerm(term, fromAutocomplete = false) {
  import('./search-filter.js').then(({ filterCards }) => {
    // Vérifier si le terme n'existe pas déjà
    const termExists = searchState.freeSearchTerms.some(t => t.term === term);
    if (!termExists) {
      if (fromAutocomplete) {
        searchState.usedAutocomplete = true;

        // Masquer le bouton de recherche
        const btnSearch = document.querySelector("#btn-search");
        if (btnSearch) {
          btnSearch.style.display = "none";
        }

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
      searchState.freeSearchTerms.push({ term });
      renderResearchItems();
      filterCards();
      updateResetButtonVisibility();
    }
  });
}
