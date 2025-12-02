const skillTree = document.querySelector("#skills-tree");
const skillTreeSection = document.querySelector("#section__skills-tree");
const skillTreeTitle = document.querySelector("#title__skills-tree");

const skillCardsSection = document.querySelector("#section__cards");
const skillCardsTitle = document.querySelector("#title__cards");

// Variables globales pour le sticky
let skillsTreePlaceholder = null;
let cardsPlaceholder = null;

// Calculer les positions seuils à partir des variables CSS
const getThresholdPositions = () => {
  const styles = getComputedStyle(document.documentElement);
  const headerH = parseInt(styles.getPropertyValue('--header-h'));
  const searchH = parseInt(styles.getPropertyValue('--search-h'));
  const spacing = parseInt(styles.getPropertyValue('--spacing'));

  return {
    baseTop: headerH + searchH
  };
};

// Gestion du scroll pour mobile
const handleScroll = () => {
  // Sur grand écran, réinitialiser
  if (window.innerWidth >= screenSmall) {
    if (skillTreeTitle && skillTreeTitle.classList.contains('is-fixed')) {
      resetFixedElement(skillTreeTitle, skillsTreePlaceholder);
      skillsTreePlaceholder = null;
    }
    if (skillCardsTitle && skillCardsTitle.classList.contains('is-fixed')) {
      resetFixedElement(skillCardsTitle, cardsPlaceholder);
      cardsPlaceholder = null;
    }
    return;
  }

  const thresholds = getThresholdPositions();

  // Gérer #title__skills-tree
  if (skillTreeTitle) {
    handleFixedTitle(
      skillTreeTitle,
      skillsTreePlaceholder,
      thresholds.baseTop,
      (placeholder) => { skillsTreePlaceholder = placeholder; }
    );
  }

  // Gérer #title__cards
  if (skillCardsTitle && skillTreeTitle) {
    const skillTreeTitleHeight = skillsTreePlaceholder
      ? skillsTreePlaceholder.offsetHeight
      : skillTreeTitle.offsetHeight;

    const spacing = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--spacing'));
    const cardsTop = thresholds.baseTop + skillTreeTitleHeight;

    handleFixedTitle(
      skillCardsTitle,
      cardsPlaceholder,
      cardsTop,
      (placeholder) => { cardsPlaceholder = placeholder; }
    );
  }
};

// Fonction pour gérer un titre fixe
const handleFixedTitle = (titleElement, placeholder, topThreshold, setPlaceholder) => {
  const isFixed = titleElement.classList.contains('is-fixed');

  // Calculer la position actuelle
  let currentTop;
  if (placeholder) {
    currentTop = placeholder.getBoundingClientRect().top;
  } else {
    currentTop = titleElement.getBoundingClientRect().top;
  }

  const shouldBeFixed = currentTop <= topThreshold;

  if (shouldBeFixed && !isFixed) {
    // Appliquer le fixed
    const rect = titleElement.getBoundingClientRect();

    // Créer un placeholder pour éviter le saut de layout
    const newPlaceholder = titleElement.cloneNode(true);
    newPlaceholder.style.visibility = 'hidden';
    newPlaceholder.style.pointerEvents = 'none';
    newPlaceholder.classList.remove('is-fixed');
    titleElement.parentNode.insertBefore(newPlaceholder, titleElement);

    // Appliquer le positionnement fixed
    titleElement.classList.add('is-fixed');
    titleElement.style.position = 'fixed';
    titleElement.style.top = topThreshold + 'px';
    titleElement.style.left = '0px';
    titleElement.style.width = '100%';
    titleElement.style.zIndex = '900';

    setPlaceholder(newPlaceholder);

  } else if (!shouldBeFixed && isFixed) {
    // Retirer le fixed
    resetFixedElement(titleElement, placeholder);
    setPlaceholder(null);
  }
};

// Fonction pour réinitialiser un élément fixe
const resetFixedElement = (element, placeholder) => {
  element.classList.remove('is-fixed');
  element.style.position = '';
  element.style.top = '';
  element.style.left = '';
  element.style.width = '';
  element.style.zIndex = '';

  if (placeholder && placeholder.parentNode) {
    placeholder.remove();
  }
};

// Gérer le redimensionnement de la fenêtre
const handleResize = () => {
  // Si on passe en grand écran, nettoyer
  if (window.innerWidth >= screenSmall) {
    if (skillTreeTitle && skillTreeTitle.classList.contains('is-fixed')) {
      resetFixedElement(skillTreeTitle, skillsTreePlaceholder);
      skillsTreePlaceholder = null;
    }
    if (skillCardsTitle && skillCardsTitle.classList.contains('is-fixed')) {
      resetFixedElement(skillCardsTitle, cardsPlaceholder);
      cardsPlaceholder = null;
    }
  }

  handleScroll();
};

// Observer les changements de hauteur du skills-tree (pour les toggles)
let resizeObserver = null;
if (skillTreeSection && window.ResizeObserver) {
  resizeObserver = new ResizeObserver(() => {
    // Recalculer les positions quand la hauteur change
    if (window.innerWidth < screenSmall) {
      handleScroll();
    }
  });
  resizeObserver.observe(skillTreeSection);
}

// Écouter les événements
window.addEventListener('scroll', handleScroll, { passive: true });
window.addEventListener('resize', handleResize);

// Initialiser au chargement
setTimeout(() => {
  handleScroll();
}, 100);

// Action au clic sur skillTreeTitle pour mobile
if (skillTreeTitle) {
  skillTreeTitle.addEventListener('click', function() {
    if (window.innerWidth < screenSmall) {
      // Si #section__skills-tree a un scroll interne, le remettre à 0
      if (skillTree) {
        skillTree.scrollTop = 0;
      }

      // Scroller en haut de la page
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, false);
}

// Action au clic sur skillCardsTitle pour mobile
if (skillCardsTitle) {
  skillCardsTitle.addEventListener('click', function() {
    if (window.innerWidth < screenSmall) {
      const thresholds = getThresholdPositions();
      const skillTreeTitleHeight = skillsTreePlaceholder
        ? skillsTreePlaceholder.offsetHeight
        : skillTreeTitle.offsetHeight;

      const spacing = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--spacing'));
      const cardsTop = thresholds.baseTop + skillTreeTitleHeight + (spacing / 2);

      // Obtenir la position actuelle de skillCardsTitle ou son placeholder
      const targetElement = cardsPlaceholder || skillCardsTitle;
      const rect = targetElement.getBoundingClientRect();
      const currentScrollY = window.scrollY;

      // Calculer la position de scroll pour que skillCardsTitle arrive à cardsTop
      const targetScrollY = currentScrollY + rect.top - cardsTop;

      window.scrollTo({
        top: targetScrollY,
        behavior: 'smooth'
      });
    }
  }, false);
}
