// SkillsTree toggle functionality
document.addEventListener("DOMContentLoaded", function() {
  const skillsTree = document.querySelector("#skills-tree");
  const toggleAllButton = document.querySelector(".toggle-all");
  const countNumber = document.querySelector(".count-number");

  if (!skillsTree) return;

  // Fonction pour compter les items visibles
  function updateVisibleCount() {
    let count = 0;

    // Sélectionner tous les items
    const allItems = skillsTree.querySelectorAll(".item");

    allItems.forEach(function(item) {
      // Vérifier si l'item est visible en remontant l'arbre
      let isVisible = true;
      let currentUl = item.closest("ul");

      // Parcourir tous les ancêtres ul
      while (currentUl && currentUl !== skillsTree) {
        // Si c'est level-1, c'est toujours visible
        if (currentUl.classList.contains("level-1")) {
          break;
        }

        // Si un ancêtre est collapsed, l'item n'est pas visible
        if (currentUl.classList.contains("is-collapsed")) {
          isVisible = false;
          break;
        }

        // Remonter au ul parent
        currentUl = currentUl.parentElement.closest("ul");
      }

      if (isVisible) {
        count++;
      }
    });

    if (countNumber) {
      countNumber.textContent = count;
    }
  }

  // Toggle individuel : clic sur un item
  skillsTree.addEventListener("click", function(event) {
    const item = event.target.closest(".item");
    if (!item) return;

    // Find the direct child list (level-2 or level-3)
    const parentLi = item.closest("li");
    const childList = parentLi.querySelector(":scope > ul");

    if (childList) {
      // Toggle between is-open and is-collapsed
      if (childList.classList.contains("is-collapsed")) {
        childList.classList.remove("is-collapsed");
        childList.classList.add("is-open");
        // Ajouter la classe sur le parent li
        parentLi.classList.remove("is-collapsed");
        parentLi.classList.add("is-open");
      } else {
        // Fermeture : fermer aussi toutes les listes descendantes
        childList.classList.remove("is-open");
        childList.classList.add("is-collapsed");
        // Ajouter la classe sur le parent li
        parentLi.classList.remove("is-open");
        parentLi.classList.add("is-collapsed");

        // Fermer toutes les listes à l'intérieur
        const allDescendantLists = childList.querySelectorAll("ul");
        allDescendantLists.forEach(function(list) {
          list.classList.remove("is-open");
          list.classList.add("is-collapsed");
          // Ajouter aussi la classe sur les parents li des listes descendantes
          const listParent = list.closest("li");
          if (listParent) {
            listParent.classList.remove("is-open");
            listParent.classList.add("is-collapsed");
          }
        });
      }

      // Mettre à jour le compteur
      updateVisibleCount();
    }
  });

  // Toggle global : tout ouvrir / tout fermer
  if (toggleAllButton) {
    toggleAllButton.addEventListener("click", function() {
      const isCurrentlyCollapsed = toggleAllButton.classList.contains("is-collapsed");
      // Ne sélectionner que les listes level-2 et level-3 (pas level-1)
      const allLists = skillsTree.querySelectorAll("ul.level-2, ul.level-3");

      if (isCurrentlyCollapsed) {
        // Tout déplier
        toggleAllButton.classList.remove("is-collapsed");
        toggleAllButton.classList.add("is-expanded");
        skillsTree.classList.remove("is-collapsed");
        skillsTree.classList.add("is-expanded");

        allLists.forEach(function(list) {
          list.classList.remove("is-collapsed");
          list.classList.add("is-open");
          // Ajouter la classe sur le parent li
          const listParent = list.closest("li");
          if (listParent) {
            listParent.classList.remove("is-collapsed");
            listParent.classList.add("is-open");
          }
        });
      } else {
        // Tout replier
        toggleAllButton.classList.remove("is-expanded");
        toggleAllButton.classList.add("is-collapsed");
        skillsTree.classList.remove("is-expanded");
        skillsTree.classList.add("is-collapsed");

        allLists.forEach(function(list) {
          list.classList.remove("is-open");
          list.classList.add("is-collapsed");
          // Ajouter la classe sur le parent li
          const listParent = list.closest("li");
          if (listParent) {
            listParent.classList.remove("is-open");
            listParent.classList.add("is-collapsed");
          }
        });
      }

      // Mettre à jour le compteur
      updateVisibleCount();
    });
  }

  // Initialiser le compteur au chargement
  updateVisibleCount();
});
