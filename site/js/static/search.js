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

  // Données complètes des membres (chargées en lazy loading au premier Enter)
  let membersData = null;
  let freeSearchSuggestions = [];

  // Charger les données complètes des membres
  async function loadMembersData() {
    if (membersData) return membersData; // Déjà chargé

    try {
      // TEMPORAIRE : Lecture depuis fichier JSON local
      // TODO : Remplacer par appel API quand disponible
      // Exemple futur : const response = await fetch(`${apiUrl}/api/members/`);
      const response = await fetch('/assets/members.json');
      membersData = await response.json();
      console.log('✅ Données membres chargées:', membersData.length, 'membres');

      // Extraire les suggestions pour la recherche libre
      extractFreeSearchSuggestions();

      return membersData;
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
      return null;
    }
  }

  // Extraire les suggestions de recherche libre depuis les données
  function extractFreeSearchSuggestions() {
    const suggestionsMap = {}; // Clé = version normalisée, Valeur = { word: string, count: number }
    const stopWords = ['dans', 'avec', 'pour', 'cette', 'sont', 'plus', 'leur', 'nous', 'vous', 'elle', 'elles', 'avoir', 'être', 'faire', 'tous', 'toutes', 'sans', 'sous', 'mais', 'donc', 'aussi'];

    function addSuggestion(word) {
      if (!word) return;
      const trimmed = word.trim();
      if (trimmed.length === 0) return;

      const normalized = normalizeString(trimmed);

      if (!suggestionsMap[normalized]) {
        // Première occurrence
        suggestionsMap[normalized] = { word: trimmed, count: 1 };
      } else {
        // Occurrence supplémentaire
        suggestionsMap[normalized].count++;
        // Si la nouvelle version commence par une majuscule, la privilégier
        if (trimmed[0] === trimmed[0].toUpperCase() && suggestionsMap[normalized].word[0] !== suggestionsMap[normalized].word[0].toUpperCase()) {
          suggestionsMap[normalized].word = trimmed;
        }
      }
    }

    function extractWordsFromText(text) {
      if (!text) return;
      const words = text.split(/[\s,;.()\[\]]+/);
      words.forEach(word => {
        const trimmed = word.trim();
        const cleaned = normalizeString(trimmed);
        // Garder les mots significatifs (> 3 caractères)
        if (cleaned.length > 3 && !stopWords.includes(cleaned)) {
          addSuggestion(trimmed);
        }
      });
    }

    membersData.forEach(member => {
      // Prénoms
      addSuggestion(member.firstName);

      // Noms
      addSuggestion(member.lastName);

      // Organisations
      addSuggestion(member.organization);

      // Villes
      addSuggestion(member.city);

      // Activité principale
      addSuggestion(member.mainActivity);

      // Bio courte
      extractWordsFromText(member.shortBio);

      // Bio longue
      extractWordsFromText(member.longBio);

      // Formation
      extractWordsFromText(member.training);

      // Publications
      extractWordsFromText(member.publications);

      // Compétences additionnelles
      extractWordsFromText(member.additionalSkills);
    });

    // Convertir en array et trier par fréquence décroissante
    freeSearchSuggestions = Object.values(suggestionsMap)
      .filter(item => item.word.length > 0)
      .sort((a, b) => b.count - a.count) // Trier par fréquence décroissante
      .map(item => item.word); // Extraire juste les mots
  }

  // Fonction pour normaliser une chaîne (lowercase, sans accents)
  function normalizeString(str) {
    return str.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  // Vérifier si un terme apparaît au début d'un mot dans un texte
  function termStartsWord(text, term) {
    if (!text || !term) return false;

    const normalizedText = normalizeString(text);
    const normalizedTerm = normalizeString(term);

    // Regex : terme au début du texte ou après un séparateur (espace, apostrophe, tiret, parenthèse, etc.)
    const regex = new RegExp(`(^|[\\s'\\-\\(\\[,;.!?:«»""])${normalizedTerm}`, 'i');
    return regex.test(normalizedText);
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
    // Toujours afficher au moins le terme tapé
    if (freeMatches.length > 0 || query.trim().length > 0) {
      const suggestionsTitle = document.createElement("div");
      suggestionsTitle.className = "autocomplete-title";
      suggestionsTitle.textContent = "Suggestions";
      autocompleteDropdown.appendChild(suggestionsTitle);

      const suggestionsContainer = document.createElement("div");
      suggestionsContainer.className = "autocomplete-suggestions-container";

      // Ajouter d'abord le terme tapé
      if (query.trim().length > 0) {
        const queryItem = document.createElement("div");
        queryItem.className = "autocomplete-item autocomplete-item--free autocomplete-item--query";
        queryItem.textContent = query.trim();

        queryItem.addEventListener("click", () => {
          addFreeSearchTerm(query.trim());
          searchBar.value = "";
          hideAutocompleteDropdown();
        });

        suggestionsContainer.appendChild(queryItem);
      }

      // Puis ajouter les suggestions matchantes
      freeMatches.forEach(suggestion => {
        const item = document.createElement("div");
        item.className = "autocomplete-item autocomplete-item--free";
        item.textContent = suggestion;

        item.addEventListener("click", () => {
          addFreeSearchTerm(suggestion);
          searchBar.value = "";
          hideAutocompleteDropdown();
        });

        suggestionsContainer.appendChild(item);
      });

      autocompleteDropdown.appendChild(suggestionsContainer);
    }

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

  // Surligner un terme directement dans les champs visibles
  function highlightInVisibleFields(card, searchTerm) {
    function highlightField(element) {
      if (!element) return;

      const originalText = element.dataset.originalText || element.textContent;
      if (!element.dataset.originalText) {
        element.dataset.originalText = originalText;
      }

      // Vérifier si le terme commence un mot dans ce champ
      if (!termStartsWord(originalText, searchTerm)) return;

      // Surligner uniquement au début des mots (insensible à la casse et aux accents)
      const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|[\\s'\\-\\(\\[,;.!?:«»""])(${escapedTerm})`, "gi");

      const result = originalText.replace(regex, '$1<mark>$2</mark>');
      element.innerHTML = result;
    }

    highlightField(card.querySelector(".member-name a"));
    highlightField(card.querySelector(".p__institution"));
    highlightField(card.querySelector(".p__short-bio"));
  }

  // Restaurer le texte original des champs visibles
  function restoreVisibleFields(card) {
    const nameLink = card.querySelector(".member-name a");
    if (nameLink && nameLink.dataset.originalText) {
      nameLink.textContent = nameLink.dataset.originalText;
      delete nameLink.dataset.originalText;
    }

    const organization = card.querySelector(".p__institution");
    if (organization && organization.dataset.originalText) {
      organization.textContent = organization.dataset.originalText;
      delete organization.dataset.originalText;
    }

    const shortBio = card.querySelector(".p__short-bio");
    if (shortBio && shortBio.dataset.originalText) {
      shortBio.textContent = shortBio.dataset.originalText;
      delete shortBio.dataset.originalText;
    }
  }

  // Extraire un extrait de texte autour d'un mot recherché (seulement pour les champs cachés)
  function extractHighlightedExcerpt(card, searchTerm) {
    const excerptLength = 120;

    // Vérifier si le terme est dans les champs visibles
    const nameLink = card.querySelector(".member-name a");
    if (nameLink && termStartsWord(nameLink.textContent, searchTerm)) {
      return ""; // Ne pas créer d'excerpt
    }

    const organization = card.querySelector(".p__institution");
    if (organization && termStartsWord(organization.textContent, searchTerm)) {
      return "";
    }

    const shortBio = card.querySelector(".p__short-bio");
    if (shortBio && termStartsWord(shortBio.textContent, searchTerm)) {
      return "";
    }

    // Compétences
    const skillsItems = card.querySelectorAll(".skills-list li");
    for (let li of skillsItems) {
      if (termStartsWord(li.textContent, searchTerm)) {
        return "";
      }
    }

    // Si pas dans les champs visibles, chercher dans les champs cachés uniquement
    const fields = [];

    // Si données complètes disponibles, ajouter les autres champs
    if (membersData) {
      let memberSlug = card.querySelector(".link-block")?.getAttribute("href");
      if (memberSlug) {
        // Retirer l'extension .html si présente
        memberSlug = memberSlug.replace(/\.html$/, "");

        const member = membersData.find(m => {
          const compareSlug = m.slug ? m.slug.replace(/\.html$/, "") : "";
          return compareSlug === memberSlug;
        });

        if (member) {
          if (member.mainActivity) fields.push({ text: member.mainActivity });
          if (member.longBio) fields.push({ text: member.longBio });
          if (member.training) fields.push({ text: member.training });
          if (member.publications) fields.push({ text: member.publications });
          if (member.additionalSkills) fields.push({ text: member.additionalSkills });
        }
      }
    }

    // Trouver le champ qui contient le terme au début d'un mot
    let foundField = null;
    let foundIndex = -1;

    for (const field of fields) {
      if (field.text && termStartsWord(field.text, searchTerm)) {
        // Trouver la position exacte du terme
        const normalizedText = normalizeString(field.text);
        const normalizedTerm = normalizeString(searchTerm);

        // Chercher toutes les positions où le terme commence un mot
        const regex = new RegExp(`(^|[\\s'\\-\\(\\[,;.!?:«»""])${normalizedTerm}`, 'gi');
        const match = regex.exec(normalizedText);

        if (match) {
          foundField = field;
          // L'index est après le séparateur (si présent)
          foundIndex = match[1] ? match.index + match[1].length : match.index;
          break;
        }
      }
    }

    // Si aucun champ ne contient le terme, retourner vide
    if (!foundField) return "";

    const originalText = foundField.text;
    const halfLength = Math.floor(excerptLength / 2);
    const normalizedTerm = normalizeString(searchTerm);

    // Calculer les positions de début et fin de l'extrait
    let start = Math.max(0, foundIndex - halfLength);
    let end = Math.min(originalText.length, foundIndex + normalizedTerm.length + halfLength);

    // Ajuster si on est au début ou à la fin
    if (start === 0) {
      end = Math.min(originalText.length, excerptLength);
    } else if (end === originalText.length) {
      start = Math.max(0, originalText.length - excerptLength);
    }

    // Extraire l'extrait
    let excerpt = originalText.substring(start, end);

    // Ajouter des ellipses si nécessaire
    if (start > 0) excerpt = "..." + excerpt;
    if (end < originalText.length) excerpt = excerpt + "...";

    // Surligner le mot recherché uniquement au début des mots (insensible à la casse et aux accents)
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[\\s'\\-\\(\\[,;.!?:«»""])(${escapedTerm})`, "gi");
    excerpt = excerpt.replace(regex, '$1<mark>$2</mark>');

    return excerpt;
  }

  // Vérifier si une card correspond à un terme de recherche libre
  function cardMatchesFreeSearch(card, term) {
    // ÉTAPE 1 : Chercher d'abord dans les champs visibles (rapide)
    // Nom complet (depuis le lien)
    const nameLink = card.querySelector(".member-name a");
    if (nameLink && termStartsWord(nameLink.textContent, term)) {
      return true;
    }

    // Organisation
    const organization = card.querySelector(".p__institution");
    if (organization && termStartsWord(organization.textContent, term)) {
      return true;
    }

    // Bio courte
    const shortBio = card.querySelector(".p__short-bio");
    if (shortBio && termStartsWord(shortBio.textContent, term)) {
      return true;
    }

    // Compétences (labels)
    const skillsItems = card.querySelectorAll(".skills-list li");
    for (let li of skillsItems) {
      if (termStartsWord(li.textContent, term)) {
        return true;
      }
    }

    // ÉTAPE 2 : Si pas trouvé et données chargées, chercher dans les données complètes
    if (membersData) {
      let memberSlug = card.querySelector(".link-block")?.getAttribute("href");
      if (memberSlug) {
        // Retirer l'extension .html si présente
        memberSlug = memberSlug.replace(/\.html$/, "");

        const member = membersData.find(m => {
          const compareSlug = m.slug ? m.slug.replace(/\.html$/, "") : "";
          return compareSlug === memberSlug;
        });

        if (member) {
          // Vérifier chaque champ séparément
          const fieldsToCheck = [
            member.firstName,
            member.lastName,
            member.shortBio,
            member.organization,
            member.city,
            member.mainActivity,
            member.longBio,
            member.training,
            member.publications,
            member.additionalSkills,
          ];

          for (let field of fieldsToCheck) {
            if (termStartsWord(field, term)) {
              return true;
            }
          }
        }
      }
    }

    return false;
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
        // Restaurer les champs visibles
        restoreVisibleFields(card);
        // Vider l'extrait
        const excerptDiv = card.querySelector(".excerpt");
        if (excerptDiv) {
          excerptDiv.innerHTML = "";
        }
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

          // Gérer le surlignage et les extraits pour la recherche libre
          if (hasFreeSearchFilters) {
            // Extraire un excerpt pour chaque terme qui matche cette card (uniquement champs cachés)
            const excerpts = [];
            searchState.freeSearchTerms.forEach(termObj => {
              if (cardMatchesFreeSearch(card, termObj.term)) {
                // Surligner dans les champs visibles
                highlightInVisibleFields(card, termObj.term);

                // Extraire excerpt pour les champs cachés
                const excerpt = extractHighlightedExcerpt(card, termObj.term);
                if (excerpt) {
                  excerpts.push(excerpt);
                }
              }
            });

            // Afficher les excerpts des champs cachés
            const excerptDiv = card.querySelector(".excerpt");
            if (excerptDiv) {
              excerptDiv.innerHTML = excerpts.join('<div class="excerpt-separator"></div>');
            }
          } else {
            // Restaurer les champs visibles si pas de recherche libre
            restoreVisibleFields(card);
            const excerptDiv = card.querySelector(".excerpt");
            if (excerptDiv) {
              excerptDiv.innerHTML = "";
            }
          }
        } else {
          card.style.display = "none";
          // Retirer is-selected
          card.querySelectorAll(".skills-list li").forEach(li => {
            li.classList.remove("is-selected");
          });
          // Restaurer les champs visibles
          restoreVisibleFields(card);
          // Vider l'extrait
          const excerptDiv = card.querySelector(".excerpt");
          if (excerptDiv) {
            excerptDiv.innerHTML = "";
          }
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

  // Charger les données des membres au démarrage pour l'autocomplétion
  loadMembersData();

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
