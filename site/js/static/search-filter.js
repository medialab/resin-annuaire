// Filtrage des cartes de membres

import { termStartsWord } from './search-utils.js';
import { membersData } from './search-data.js';
import { searchState } from './search-state.js';
import { highlightInVisibleFields, restoreVisibleFields, extractHighlightedExcerpt } from './search-highlight.js';

// Vérifier si une card correspond à un terme de recherche libre
export function cardMatchesFreeSearch(card, term) {
  // ÉTAPE 1 : Chercher d'abord dans les champs visibles 
  const nameLink = card.querySelector(".member-name a");
  if (nameLink && termStartsWord(nameLink.textContent, term)) {
    return true;
  }

  const organization = card.querySelector(".p__institution");
  if (organization && termStartsWord(organization.textContent, term)) {
    return true;
  }

  const shortBio = card.querySelector(".p__short-bio");
  if (shortBio && termStartsWord(shortBio.textContent, term)) {
    return true;
  }

  const skillsItems = card.querySelectorAll(".skills-list li");
  for (let li of skillsItems) {
    if (termStartsWord(li.textContent, term)) {
      return true;
    }
  }

  // ÉTAPE 2 : Si pas trouvé, chercher dans les données complêtes
  if (membersData) {
    let memberSlug = card.querySelector(".link-block")?.getAttribute("href");
    if (memberSlug) {
      memberSlug = memberSlug.replace(/\.html$/, "");

      const member = membersData.find(m => {
        const compareSlug = m.slug ? m.slug.replace(/\.html$/, "") : "";
        return compareSlug === memberSlug;
      });

      if (member) {
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
export function filterCards() {
  const cardsWrapper = document.querySelector(".cards-wrapper");
  const countSpan = document.querySelector("#count-members > span");
  const skillsTree = document.querySelector("#skills-tree");

  if (!cardsWrapper) return;

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
          const excerpts = [];
          searchState.freeSearchTerms.forEach(termObj => {
            if (cardMatchesFreeSearch(card, termObj.term)) {
              // champs visibles
              highlightInVisibleFields(card, termObj.term);

              // excerpt pour les champs cachés
              const excerpt = extractHighlightedExcerpt(card, termObj.term);
              if (excerpt) {
                excerpts.push(excerpt);
              }
            }
          });

          const excerptDiv = card.querySelector(".excerpt");
          if (excerptDiv) {
            excerptDiv.innerHTML = excerpts.join('<div class="excerpt-separator"></div>');
          }
        } else {
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

  // compteur
  if (countSpan) {
    countSpan.textContent = visibleCount;
  }
}
