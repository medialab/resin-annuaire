// Système de recherche et filtrage
document.addEventListener("DOMContentLoaded", function() {
  const researchItems = document.querySelector("#research-items");
  const researchItemsWrapper = document.querySelector("#section__research-items");
  const searchBar = document.querySelector("#searchBar");
  const cardsWrapper = document.querySelector(".cards-wrapper");
  const countSpan = document.querySelector("#count-members > span");
  const skillsTree = document.querySelector("#skills-tree");


  // open/close one phone ----------------------------------------

  // btnToggle.addEventListener("click", function(event) {
  //   if(window.innerWidth < screenSmall){
  //     document.body.classList.add("has-skillTree");
  //   }
  // });






  if (!researchItems || !searchBar || !cardsWrapper) return;

  // État de la recherche
  const searchState = {
    selectedSkills: [], // {id: number, childrenIds: [numbers], label: string}
    freeSearchTerms: [], // {term: string}
  };

  // Afficher/masquer le bouton reset
  function updateResetButtonVisibility() {
    const hasItems = searchState.selectedSkills.length > 0 || searchState.freeSearchTerms.length > 0;
    const resetBtn = document.querySelector("#reset-search");

    if (resetBtn) {
      resetBtn.style.display = hasItems ? "block" : "none";
    }
  }

  // Réinitialiser la recherche
  function resetSearch() {
    // Vider l'état
    searchState.selectedSkills = [];
    searchState.freeSearchTerms = [];

    // Vider le champ de recherche
    searchBar.value = "";

    // Décocher toutes les checkboxes
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
  }

  // Afficher les tags dans #research-items
  function renderResearchItems() {
    // Vider le contenu
    researchItems.innerHTML = "";

    // Ajouter les tags de compétences
    searchState.selectedSkills.forEach(skill => {
      const tag = createTag(skill.label, "skill", () => removeSkill(skill.id), skill.field, skill.id);
      researchItems.appendChild(tag);
    });

    // Ajouter les tags de recherche libre
    searchState.freeSearchTerms.forEach(term => {
      const tag = createTag(term.term, "free", () => removeFreeSearchTerm(term.term));
      researchItems.appendChild(tag);
    });

    // Gérer la classe has-items sur le wrapper
    const hasItems = searchState.selectedSkills.length > 0 || searchState.freeSearchTerms.length > 0;
    if (researchItemsWrapper) {
      if (hasItems) {
        researchItemsWrapper.classList.add("has-items");
      } else {
        researchItemsWrapper.classList.remove("has-items");
      }
    }
  }

  // Créer un tag
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
    removeBtn.addEventListener("click", onRemove);

    tag.appendChild(labelSpan);
    tag.appendChild(removeBtn);

    return tag;
  }

  // Retirer une compétence
  function removeSkill(skillId) {
    searchState.selectedSkills = searchState.selectedSkills.filter(s => s.id !== skillId);

    // Décocher la checkbox correspondante
    if (skillsTree) {
      const checkbox = skillsTree.querySelector(`#cb-${skillId}`);

      if (checkbox && checkbox.checked) {
        checkbox.checked = false;
        const item = checkbox.closest(".item");
        if (item) {
          item.classList.remove("is-checked");
          delete item.dataset.checkedBy;
        }
        // Déclencher l'événement change pour que skillsTree.js gère le décochage des enfants
        checkbox.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }

    renderResearchItems();
    filterCards();
    updateResetButtonVisibility();
  }

  // Retirer un terme de recherche libre
  function removeFreeSearchTerm(term) {
    searchState.freeSearchTerms = searchState.freeSearchTerms.filter(t => t.term !== term);
    renderResearchItems();
    filterCards();
    updateResetButtonVisibility();
  }

  // Filtrer les cards et mettre à jour le compteur + ajouter is-selected
  function filterCards() {
    const allCards = cardsWrapper.querySelectorAll(".card");
    let visibleCount = 0;

    // Collecter tous les IDs à rechercher (compétences + leurs enfants)
    const allSearchedIds = new Set();
    searchState.selectedSkills.forEach(skill => {
      skill.childrenIds.forEach(id => allSearchedIds.add(id));
    });

    // Si aucun filtre, afficher toutes les cards
    const hasSkillFilters = searchState.selectedSkills.length > 0;
    const hasFreeSearchFilters = searchState.freeSearchTerms.length > 0;

    if (!hasSkillFilters && !hasFreeSearchFilters) {
      allCards.forEach(card => {
        card.style.display = "block";
        visibleCount++;
        // Retirer is-selected de toutes les skills
        card.querySelectorAll(".skills-list li").forEach(li => {
          li.classList.remove("is-selected");
        });
      });
    } else {
      allCards.forEach(card => {
        let shouldShow = false;

        // Vérifier les compétences sélectionnées
        if (hasSkillFilters) {
          const cardSkillsStr = card.getAttribute("data-skills");
          if (cardSkillsStr) {
            const cardSkills = cardSkillsStr.split(',').map(id => parseInt(id, 10));

            // Vérifier si la card possède au moins une des compétences sélectionnées
            const hasMatchingSkill = cardSkills.some(cardSkillId => allSearchedIds.has(cardSkillId));

            if (hasMatchingSkill) {
              shouldShow = true;
            }
          }
        }

        // TODO: Ajouter la recherche libre dans les prochaines étapes

        // Afficher ou masquer la card
        if (shouldShow) {
          card.style.display = "block";
          visibleCount++;

          // Ajouter is-selected aux skills correspondantes
          card.querySelectorAll(".skills-list li").forEach(li => {
            const skillId = parseInt(li.getAttribute("data-skill-id"), 10);
            if (allSearchedIds.has(skillId)) {
              li.classList.add("is-selected");
            } else {
              li.classList.remove("is-selected");
            }
          });
        } else {
          card.style.display = "none";
          // Retirer is-selected
          card.querySelectorAll(".skills-list li").forEach(li => {
            li.classList.remove("is-selected");
          });
        }
      });
    }

    // Mettre à jour le compteur
    if (countSpan) {
      countSpan.textContent = visibleCount;
    }
  }

  // Synchroniser les tags avec les compétences cochées "user"
  function syncSkillsFromTree() {
    if (!skillsTree) return;

    // Récupérer toutes les checkboxes cochées "user"
    const userCheckedItems = skillsTree.querySelectorAll('.item[data-checked-by="user"]');

    // Créer un nouveau tableau de compétences basé sur les items "user"
    const newSelectedSkills = [];
    userCheckedItems.forEach(item => {
      const li = item.closest("li");
      const skillId = parseInt(item.getAttribute("data-skill-id"), 10);
      const childrenIdsStr = li.getAttribute("data-children-ids");
      const childrenIds = childrenIdsStr ? childrenIdsStr.split(',').map(id => parseInt(id, 10)) : [skillId];
      const label = item.querySelector(".name")?.textContent.trim();
      const field = item.getAttribute("data-field");

      if (skillId && label) {
        newSelectedSkills.push({ id: skillId, childrenIds, label, field });
      }
    });

    // Mettre à jour l'état seulement si c'est différent
    const hasChanged =
      newSelectedSkills.length !== searchState.selectedSkills.length ||
      newSelectedSkills.some(skill => !searchState.selectedSkills.find(s => s.id === skill.id));

    if (hasChanged) {
      searchState.selectedSkills = newSelectedSkills;
      renderResearchItems();
      filterCards();
      updateResetButtonVisibility();
    }
  }

  // Écouter les changements des checkboxes (cochage/décochage)
  if (skillsTree) {
    skillsTree.addEventListener("change", function(event) {
      const checkbox = event.target;
      if (!checkbox.classList.contains("item__checkbox")) return;

      // Utiliser setTimeout pour laisser le temps à skillsTree.js de mettre à jour les data-checked-by
      setTimeout(syncSkillsFromTree, 0);
    });

    // Écouter aussi les clics pour détecter la transformation propagation → user
    skillsTree.addEventListener("click", function(event) {
      const label = event.target.closest("label");
      if (!label) return;

      const checkboxId = label.getAttribute("for");
      if (!checkboxId) return;

      const checkbox = document.getElementById(checkboxId);
      if (!checkbox) return;

      const item = checkbox.closest(".item");

      // Si c'était "propagation" et va devenir "user", on sync après un court délai
      if (checkbox.checked && item.dataset.checkedBy === "propagation") {
        setTimeout(syncSkillsFromTree, 10);
      }
    });
  }

  // Initialisation
  updateResetButtonVisibility();

  // Attacher l'événement click au bouton reset
  const resetBtn = document.querySelector("#reset-search");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetSearch);
  }
});
