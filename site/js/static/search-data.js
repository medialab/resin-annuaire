// Gestion des données de recherche (membres et compétences)

import { normalizeString } from './search-utils.js';

export let allSkills = [];
export let membersData = null;
export let freeSearchSuggestions = [];

// Charger la liste des compétences depuis l'arbre
export function loadSkillsFromTree() {
  const skillsTree = document.querySelector("#skills-tree");
  const skills = [];

  if (skillsTree) {
    skillsTree.querySelectorAll(".item").forEach(item => {
      const skillId = parseInt(item.getAttribute("data-skill-id"), 10);
      const label = item.querySelector(".name")?.textContent.trim();
      const field = item.getAttribute("data-field");
      const li = item.closest("li");
      const childrenIdsStr = li?.getAttribute("data-children-ids");
      const childrenIds = childrenIdsStr ? childrenIdsStr.split(',').map(id => parseInt(id, 10)) : [skillId];

      if (skillId && label) {
        skills.push({ id: skillId, label, field, childrenIds });
      }
    });
  }

  allSkills = skills;
  return skills;
}

// Charger les données complètes des membres
export async function loadMembersData() {
  if (membersData) return membersData; // Déjà  chargé

  try {
    // TEMPORAIRE : Lecture depuis fichier JSON local
    // TODO : Remplacer par appel API quand disponible
    // Exemple futur : const response = await fetch(`${apiUrl}/api/members/`);
    const response = await fetch('/assets/members.json');
    membersData = await response.json();
    console.log('Données membres chargées:', membersData.length, 'membres');

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
  const stopWords = ['ensuite', 'dans', 'avec', 'pour', 'cette', 'sont', 'plus', 'leur', 'nous', 'vous', 'elle', 'elles', 'avoir', 'être', 'faire', 'tous', 'toutes', 'sans', 'sous', 'mais', 'donc', 'aussi'];

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
    addSuggestion(member.firstName);
    addSuggestion(member.lastName);
    addSuggestion(member.organization);
    addSuggestion(member.city);
    addSuggestion(member.mainActivity);
    extractWordsFromText(member.shortBio);
    extractWordsFromText(member.longBio);
    extractWordsFromText(member.training);
    extractWordsFromText(member.publications);
    extractWordsFromText(member.additionalSkills);
  });

  // Convertir en array et trier par fréquence décroissante
  freeSearchSuggestions = Object.values(suggestionsMap)
    .filter(item => item.word.length > 0)
    .sort((a, b) => b.count - a.count) 
    .map(item => item.word); // Extraire juste les mots
}
