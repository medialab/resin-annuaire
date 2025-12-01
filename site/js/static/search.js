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


  // open/close one phone ----------------------------------------

  // btnToggle.addEventListener("click", function(event) {
  //   if(window.innerWidth < screenSmall){
  //     document.body.classList.add("has-skillTree");
  //   }
  // });






  if (!researchItems || !searchBar || !cardsWrapper) return;

  // Fonction pour mettre à jour la hauteur de la section research-items
  function updateSearchResultHeight() {
    if (researchItemsWrapper) {
      const height = researchItemsWrapper.offsetHeight;
      document.body.style.setProperty('--search-result-h', `${height}px`);
    }
  }

  // Charger la liste des compétences depuis l'arbre
  const allSkills = [];
  if (skillsTree) {
    skillsTree.querySelectorAll(".item").forEach(item => {
      const skillId = parseInt(item.getAttribute("data-skill-id"), 10);
      const label = item.querySelector(".name")?.textContent.trim();
      const field = item.getAttribute("data-field");
      const li = item.closest("li");
      const childrenIdsStr = li?.getAttribute("data-children-ids");
      const childrenIds = childrenIdsStr ? childrenIdsStr.split(',').map(id => parseInt(id, 10)) : [skillId];

      if (skillId && label) {
        allSkills.push({ id: skillId, label, field, childrenIds });
      }
    });
  }

  // Fonction pour normaliser une chaîne (lowercase, sans accents)
  function normalizeString(str) {
    return str.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

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

  // ======== AUTOCOMPLÉTION ========

  // Afficher les suggestions d'autocomplétion
  function showAutocompleteSuggestions(query) {
    if (!autocompleteDropdown) return;

    // Normaliser la recherche
    const normalizedQuery = normalizeString(query);

    // Filtrer les compétences qui matchent
    const matches = allSkills.filter(skill => {
      const normalizedLabel = normalizeString(skill.label);
      return normalizedLabel.includes(normalizedQuery);
    }).slice(0, 10); // Limiter à 10 suggestions

    // Si aucun résultat ou recherche vide, masquer le dropdown
    if (matches.length === 0 || query.trim() === "") {
      autocompleteDropdown.innerHTML = "";
      autocompleteDropdown.style.display = "none";
      return;
    }

    // Afficher les suggestions
    autocompleteDropdown.innerHTML = "";

    // Créer le titre "Compétences"
    const skillsTitle = document.createElement("div");
    skillsTitle.className = "autocomplete-title";
    skillsTitle.textContent = "Compétences";
    autocompleteDropdown.appendChild(skillsTitle);

    // Créer le container pour les compétences
    const skillsContainer = document.createElement("div");
    skillsContainer.className = "autocomplete-skills-container";

    matches.forEach(skill => {
      const item = document.createElement("div");
      item.className = "autocomplete-item";
      item.setAttribute("data-skill-id", skill.id);
      item.setAttribute("data-field", skill.field);
      item.textContent = skill.label;

      item.addEventListener("click", () => selectSkillFromAutocomplete(skill));

      skillsContainer.appendChild(item);
    });

    autocompleteDropdown.appendChild(skillsContainer);
    autocompleteDropdown.style.display = "block";
  }

  // Sélectionner une compétence depuis l'autocomplétion
  function selectSkillFromAutocomplete(skill) {
    // Cocher la checkbox correspondante dans l'arbre
    if (skillsTree) {
      const checkbox = skillsTree.querySelector(`#cb-${skill.id}`);
      if (checkbox && !checkbox.checked) {
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }

    // Vider le champ de recherche
    searchBar.value = "";

    // Masquer le dropdown
    hideAutocompleteDropdown();
  }

  // Masquer le dropdown d'autocomplétion
  function hideAutocompleteDropdown() {
    if (autocompleteDropdown) {
      autocompleteDropdown.innerHTML = "";
      autocompleteDropdown.style.display = "none";
    }
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

    // Mettre à jour la hauteur de la section après le rendu
    updateSearchResultHeight();
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
    tag.addEventListener("click", onRemove);

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

  // Vérifier si une card correspond à un terme de recherche libre
  function cardMatchesFreeSearch(card, term) {
    const normalizedTerm = normalizeString(term);

    // Récupérer les données de la card depuis les data-attributes ou le contenu
    const cardText = [];

    // Nom complet (depuis le lien)
    const nameLink = card.querySelector(".member-name a");
    if (nameLink) cardText.push(nameLink.textContent);

    // Organisation
    const organization = card.querySelector(".p__institution");
    if (organization) cardText.push(organization.textContent);

    // Bio courte
    const shortBio = card.querySelector(".p__short-bio");
    if (shortBio) cardText.push(shortBio.textContent);

    // Compétences (labels)
    const skillsItems = card.querySelectorAll(".skills-list li");
    skillsItems.forEach(li => cardText.push(li.textContent));

    // Concaténer et normaliser tout le texte
    const fullText = normalizeString(cardText.join(" "));

    // Vérifier si le terme est présent
    return fullText.includes(normalizedTerm);
  }

  // Filtrer les cards et mettre à jour le compteur + ajouter is-selected
  function filterCards() {
    const allCards = cardsWrapper.querySelectorAll(".card");
    let visibleCount = 0;

    // Collecter tous les IDs à rechercher (compétences + leurs enfants) pour le filtrage
    const allSearchedIds = new Set();
    searchState.selectedSkills.forEach(skill => {
      skill.childrenIds.forEach(id => allSearchedIds.add(id));
    });

    // Collecter TOUS les IDs cochés (user + propagation) pour la classe is-selected
    const allCheckedIds = new Set();
    if (skillsTree) {
      skillsTree.querySelectorAll(".item__checkbox:checked").forEach(checkbox => {
        const item = checkbox.closest(".item");
        const skillId = parseInt(item.getAttribute("data-skill-id"), 10);
        if (skillId) {
          allCheckedIds.add(skillId);
        }
      });
    }

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

        // Vérifier la recherche libre (logique OR)
        if (hasFreeSearchFilters && !shouldShow) {
          // La card doit matcher AU MOINS UN terme de recherche libre
          const matchesFreeSearch = searchState.freeSearchTerms.some(termObj =>
            cardMatchesFreeSearch(card, termObj.term)
          );

          if (matchesFreeSearch) {
            shouldShow = true;
          }
        }

        // Afficher ou masquer la card
        if (shouldShow) {
          card.style.display = "block";
          visibleCount++;

          // Ajouter is-selected aux skills correspondantes (user + propagation)
          card.querySelectorAll(".skills-list li").forEach(li => {
            const skillId = parseInt(li.getAttribute("data-skill-id"), 10);
            if (allCheckedIds.has(skillId)) {
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
  updateSearchResultHeight();
  hideAutocompleteDropdown(); // Masquer le dropdown au chargement

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

    // Vérifier si c'est une compétence existante
    const normalizedQuery = normalizeString(query);
    const matchingSkill = allSkills.find(skill =>
      normalizeString(skill.label) === normalizedQuery
    );

    if (matchingSkill) {
      // C'est une compétence → la sélectionner via l'autocomplétion
      selectSkillFromAutocomplete(matchingSkill);
    } else {
      // Ce n'est pas une compétence → ajouter comme recherche libre
      addFreeSearchTerm(query);
      searchBar.value = "";
      hideAutocompleteDropdown();
    }
  }

  // Ajouter un terme de recherche libre
  function addFreeSearchTerm(term) {
    // Vérifier si le terme n'existe pas déjà
    const termExists = searchState.freeSearchTerms.some(t => t.term === term);
    if (!termExists) {
      searchState.freeSearchTerms.push({ term });
      renderResearchItems();
      filterCards();
      updateResetButtonVisibility();
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
