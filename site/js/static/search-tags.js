// Gestion des tags de recherche (comp�tences et recherche libre)

import { updateSearchResultHeight } from './search-utils.js';
import { searchState, updateResetButtonVisibility } from './search-state.js';

// Afficher les tags dans #research-items
export function renderResearchItems() {
  const researchItems = document.querySelector("#research-items");
  const researchItemsWrapper = document.querySelector("#section__research-items");

  if (!researchItems) return;

  // Import dynamique pour �viter d�pendance circulaire
  import('./search-filter.js').then(({ filterCards }) => {
    // Vider le contenu
    researchItems.innerHTML = "";

    // Cr�er tous les tags
    const allTags = [];

    // Ajouter les tags de comp�tences
    searchState.selectedSkills.forEach(skill => {
      const tag = createTag(skill.label, "skill", () => removeSkill(skill.id), skill.field, skill.id);
      allTags.push(tag);
    });

    // Ajouter les tags de recherche libre
    searchState.freeSearchTerms.forEach(term => {
      const tag = createTag(term.term, "free", () => removeFreeSearchTerm(term.term));
      allTags.push(tag);
    });

    // Ajouter les tags avec des s�parateurs "ou"
    allTags.forEach((tag, index) => {
      researchItems.appendChild(tag);

      // Ajouter "ou" apr�s chaque tag sauf le dernier
      if (index < allTags.length - 1) {
        const separator = document.createElement("span");
        separator.className = "research-separator";
        separator.textContent = "ou";
        researchItems.appendChild(separator);
      }
    });

    // G�rer la classe has-items sur le wrapper (seulement si utilis� l'autocompl�tion ET qu'il y a des items)
    const hasItems = searchState.selectedSkills.length > 0 || searchState.freeSearchTerms.length > 0;
    if (researchItemsWrapper) {
      if (searchState.usedAutocomplete && hasItems) {
        researchItemsWrapper.classList.add("has-items");
      } else {
        researchItemsWrapper.classList.remove("has-items");
      }
    }

    // Mettre � jour la hauteur de la section apr�s le rendu
    updateSearchResultHeight();
  });
}

// Cr�er un tag
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

// Retirer une comp�tence
export function removeSkill(skillId) {
  import('./search-filter.js').then(({ filterCards }) => {
    searchState.selectedSkills = searchState.selectedSkills.filter(s => s.id !== skillId);

    // D�cocher la checkbox correspondante
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
        // D�clencher l'�v�nement change pour que skillsTree.js g�re le d�cochage des enfants
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
    // V�rifier si le terme n'existe pas d�j�
    const termExists = searchState.freeSearchTerms.some(t => t.term === term);
    if (!termExists) {
      if (fromAutocomplete) {
        searchState.usedAutocomplete = true;
        // Remonter en haut de la page
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      searchState.freeSearchTerms.push({ term });
      renderResearchItems();
      filterCards();
      updateResetButtonVisibility();
    }
  });
}
