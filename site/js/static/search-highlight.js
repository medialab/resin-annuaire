// Gestion du surlignage et des extraits de texte

import { termStartsWord, normalizeString } from './search-utils.js';
import { membersData } from './search-data.js';

// Surligner un terme directement dans les champs visibles
export function highlightInVisibleFields(card, searchTerm) {
  function highlightField(element) {
    if (!element) return;

    const originalText = element.dataset.originalText || element.textContent;
    if (!element.dataset.originalText) {
      element.dataset.originalText = originalText;
    }

    // Vérifier si le terme commence un mot dans ce champ
    if (!termStartsWord(originalText, searchTerm)) return;

    // Surligner uniquement au dàbut des mots (insensible à la casse et aux accents)
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[\\s'\\-\\(\\[,;.!?:""])(${escapedTerm})`, "gi");

    const result = originalText.replace(regex, '$1<mark>$2</mark>');
    element.innerHTML = result;
  }

  highlightField(card.querySelector(".member-name a"));
  highlightField(card.querySelector(".p__institution"));
  highlightField(card.querySelector(".p__short-bio"));
}

// Restaurer le texte original des champs visibles
export function restoreVisibleFields(card) {
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
export function extractHighlightedExcerpt(card, searchTerm) {
  const excerptLength = 120;

  // Vérifier si le terme est dans les champs visibles
  const nameLink = card.querySelector(".member-name a");
  if (nameLink && termStartsWord(nameLink.textContent, searchTerm)) {
    return ""; 
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

  if (membersData) {
    let memberSlug = card.querySelector(".link-block")?.getAttribute("href");
    if (memberSlug) {
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
      const normalizedText = normalizeString(field.text);
      const normalizedTerm = normalizeString(searchTerm);

      const regex = new RegExp(`(^|[\\s'\\-\\(\\[,;.!?:""])${normalizedTerm}`, 'gi');
      const match = regex.exec(normalizedText);

      if (match) {
        foundField = field;
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

  if (start > 0) excerpt = "..." + excerpt;
  if (end < originalText.length) excerpt = excerpt + "...";

  // Surligner le mot recherché uniquement au début des mots (insensible à la casse et aux accents)
  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(^|[\\s'\\-\\(\\[,;.!?:""])(${escapedTerm})`, "gi");
  excerpt = excerpt.replace(regex, '$1<mark>$2</mark>');

  return excerpt;
}
