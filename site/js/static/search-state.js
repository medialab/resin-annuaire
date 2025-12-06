// Gestion de l'état de la recherche

// État de la recherche
export const searchState = {
  selectedSkills: [], // {id: number, childrenIds: [numbers], label: string}
  freeSearchTerms: [], // {term: string}
  usedAutocomplete: false, // true si l'utilisateur a utilisé l'autocomplétion
};

// Afficher/masquer le bouton reset
export function updateResetButtonVisibility() {
  const hasItems = searchState.selectedSkills.length > 0 || searchState.freeSearchTerms.length > 0;
  const resetBtn = document.querySelector("#reset-search");

  if (resetBtn) {
    resetBtn.style.display = hasItems ? "block" : "none";
  }
}

// Réinitialiser la recherche
export function resetSearch() {
  // Import dynamique pour éviter les dépendances circulaires
  import('./search-tags.js').then(({ renderResearchItems }) => {
    import('./search-filter.js').then(({ filterCards }) => {
      // Vider l'état
      searchState.selectedSkills = [];
      searchState.freeSearchTerms = [];
      searchState.usedAutocomplete = false;

      // Vider le champ de recherche
      const searchBar = document.querySelector("#searchBar");
      if (searchBar) {
        searchBar.value = "";
      }

      // Décocher toutes les checkboxes
      const skillsTree = document.querySelector("#skills-tree");
      if (skillsTree) {
        const checkboxes = skillsTree.querySelectorAll(".item__checkbox:checked");
        checkboxes.forEach(cb => {
          cb.checked = false;
          const item = cb.closest(".item");
          if (item) {
            item.classList.remove("is-checked");
            delete item.dataset.checkedBy;
          }
        });
      }

      // Rafraîchir l'affichage
      renderResearchItems();
      filterCards();
      updateResetButtonVisibility();
    });
  });
}
