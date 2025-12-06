// Fonctions utilitaires pour la recherche

// Fonction pour normaliser une chaîne (lowercase, sans accents)
export function normalizeString(str) {
  return str.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Vérifier si un terme apparaît au début d'un mot dans un texte
export function termStartsWord(text, term) {
  if (!text || !term) return false;

  const normalizedText = normalizeString(text);
  const normalizedTerm = normalizeString(term);

  // Regex : terme au début du texte ou aprés un séparateur (espace, apostrophe, tiret, parenthèse, etc.)
  const regex = new RegExp(`(^|[\\s'\\-\\(\\[,;.!?:""])${normalizedTerm}`, 'i');
  return regex.test(normalizedText);
}

// Fonction pour mettre à jour la hauteur de la section research-items
export function updateSearchResultHeight() {
  const researchItemsWrapper = document.querySelector("#section__research-items");
  if (researchItemsWrapper) {
    const height = researchItemsWrapper.offsetHeight;
    document.body.style.setProperty('--search-result-h', `${height}px`);
  }
}
