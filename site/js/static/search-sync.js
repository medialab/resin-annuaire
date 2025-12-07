// Synchronisation avec l'arbre de compétences (skillsTree)

import { searchState, updateResetButtonVisibility } from './search-state.js';
import { renderResearchItems } from './search-tags.js';
import { filterCards } from './search-filter.js';

// Synchroniser les tags avec les compétences cochées "user"
export function syncSkillsFromTree() {
  const skillsTree = document.querySelector("#skills-tree");
  if (!skillsTree) return;

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

// Initialiser les event listeners pour l'arbre de compètences
export function initSkillsTreeListeners() {
  const skillsTree = document.querySelector("#skills-tree");
  if (!skillsTree) return;

  // Changements des checkboxes (cochage/dècochage)
  skillsTree.addEventListener("change", function(event) {
    const checkbox = event.target;
    if (!checkbox.classList.contains("item__checkbox")) return;

    // Utiliser setTimeout pour laisser le temps à skillsTree.js de mettre à jour les data-checked-by
    setTimeout(syncSkillsFromTree, 0);
  });

  // Détecter la transformation propagation à user
  skillsTree.addEventListener("click", function(event) {
    const label = event.target.closest("label");
    if (!label) return;

    const checkboxId = label.getAttribute("for");
    if (!checkboxId) return;

    const checkbox = document.getElementById(checkboxId);
    if (!checkbox) return;

    const item = checkbox.closest(".item");

    if (checkbox.checked && item.dataset.checkedBy === "propagation") {
      setTimeout(syncSkillsFromTree, 10);
    }
  });
}
