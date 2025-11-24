// SkillsTree toggle functionality
document.addEventListener("DOMContentLoaded", function() {
  const skillsTree = document.querySelector("#skills-tree");
  const toggleAllButton = document.querySelector(".toggle-all");
  const toggleGraphButton = document.querySelector("#toggle-graph");
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

  // Toggle individuel : clic sur le bouton toggle
  skillsTree.addEventListener("click", function(event) {
    const toggleButton = event.target.closest(".btn__toggle");
    if (!toggleButton) return;

    // Find the direct child list (level-2 or level-3)
    const parentLi = toggleButton.closest("li");
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

  // Toggle graph view : afficher/masquer les graphiques
  if (toggleGraphButton) {
    toggleGraphButton.addEventListener("click", function() {
      document.body.classList.toggle("graph-view");
    });
  }

  // Initialiser le compteur au chargement
  updateVisibleCount();

  // ======== GESTION DES CHECKBOXES ========

  // Fonction pour cocher tous les enfants par propagation
  function checkChildrenByPropagation(parentLi) {
    const childList = parentLi.querySelector(":scope > ul");
    if (!childList) return;

    const childItems = childList.querySelectorAll(":scope > li");
    childItems.forEach(function(childLi) {
      const childItem = childLi.querySelector(".item");
      const childCheckbox = childLi.querySelector(".item__checkbox");

      if (childCheckbox && !childCheckbox.checked) {
        childCheckbox.checked = true;
        childItem.dataset.checkedBy = "propagation";
        childItem.classList.add("is-checked");

        // Récursion : cocher les enfants de cet enfant par propagation aussi
        checkChildrenByPropagation(childLi);
      }
    });
  }

  // Fonction pour décocher tous les enfants
  function uncheckAllChildren(parentLi) {
    const childList = parentLi.querySelector(":scope > ul");
    if (!childList) return;

    const childItems = childList.querySelectorAll(":scope > li");
    childItems.forEach(function(childLi) {
      const childItem = childLi.querySelector(".item");
      const childCheckbox = childLi.querySelector(".item__checkbox");

      if (childCheckbox && childCheckbox.checked) {
        childCheckbox.checked = false;
        delete childItem.dataset.checkedBy;
        childItem.classList.remove("is-checked");

        // Récursion : décocher les enfants de cet enfant
        uncheckAllChildren(childLi);
      }
    });
  }

  // Fonction pour décocher tous les parents ET leurs autres enfants (sauf la branche de l'élément cliqué)
  function uncheckParentsAndSiblings(clickedLi) {
    // Remonter au <ul> parent
    let parentUl = clickedLi.parentElement;

    // Puis remonter au <li> parent
    let parentLi = parentUl ? parentUl.parentElement : null;
    let childLiToKeep = clickedLi; // On garde la trace de la branche à conserver

    while (parentLi && parentLi.tagName === "LI") {
      const parentItem = parentLi.querySelector(":scope > .item");
      const parentCheckbox = parentItem ? parentItem.querySelector(".item__checkbox") : null;

      // Décocher le parent (peu importe si "user" ou "propagation")
      if (parentCheckbox && parentCheckbox.checked) {
        parentCheckbox.checked = false;
        delete parentItem.dataset.checkedBy;
        parentItem.classList.remove("is-checked");
      }

      // Décocher SEULEMENT les frères/sœurs qui sont "propagation" (pas les "user")
      const siblingsUl = childLiToKeep.parentElement;
      if (siblingsUl) {
        const siblings = siblingsUl.querySelectorAll(":scope > li");
        siblings.forEach(function(siblingLi) {
          if (siblingLi === childLiToKeep) return; // Ne pas décocher la branche à conserver

          const siblingItem = siblingLi.querySelector(":scope > .item");
          const siblingCheckbox = siblingItem ? siblingItem.querySelector(".item__checkbox") : null;

          // Ne décocher que si c'est "propagation"
          if (siblingCheckbox && siblingCheckbox.checked && siblingItem.dataset.checkedBy === "propagation") {
            siblingCheckbox.checked = false;
            delete siblingItem.dataset.checkedBy;
            siblingItem.classList.remove("is-checked");

            // Décocher tous ses descendants
            uncheckAllChildren(siblingLi);
          }
        });
      }

      // Continuer à remonter
      childLiToKeep = parentLi;
      parentUl = parentLi.parentElement;
      parentLi = parentUl ? parentUl.parentElement : null;
    }
  }

  // Intercepter le clic pour gérer le cas spécial : clic sur élément coché par propagation
  skillsTree.addEventListener("click", function(event) {
    // Vérifier si on a cliqué sur un label
    const label = event.target.closest("label");
    if (!label) return;

    // Récupérer la checkbox associée
    const checkboxId = label.getAttribute("for");
    if (!checkboxId) return;

    const checkbox = document.getElementById(checkboxId);
    if (!checkbox) return;

    const item = checkbox.closest(".item");
    const parentLi = checkbox.closest("li");

    // Si la checkbox est actuellement cochée et cochée par propagation
    if (checkbox.checked && item.dataset.checkedBy === "propagation") {
      // Empêcher le décochage
      event.preventDefault();

      // La transformer en check direct (user)
      item.dataset.checkedBy = "user";

      // Décocher tous les parents ET leurs autres enfants (sauf la branche de l'élément cliqué)
      uncheckParentsAndSiblings(parentLi);
    }
  });

  // Écouter les changements sur toutes les checkboxes
  skillsTree.addEventListener("change", function(event) {
    const checkbox = event.target;
    if (!checkbox.classList.contains("item__checkbox")) return;

    const parentLi = checkbox.closest("li");
    const item = checkbox.closest(".item");

    if (checkbox.checked) {
      // La checkbox est cochée directement par l'utilisateur
      item.dataset.checkedBy = "user";
      item.classList.add("is-checked");

      // Cocher tous les enfants par propagation
      checkChildrenByPropagation(parentLi);

    } else {
      // La checkbox est décochée
      delete item.dataset.checkedBy;
      item.classList.remove("is-checked");

      // Décocher tous les enfants
      uncheckAllChildren(parentLi);
    }
  });
});
