const skillTree = document.querySelector("#skills-tree");
const skillTreeTitle = document.querySelector("#title__skills-tree");

const skillCards = document.querySelector("#section__cards");
const skillCardsTitle = document.querySelector("#title__cards");

// Variables globales pour le sticky
let cardsPlaceholder = null;
let handleScroll = null; // Sera définie plus bas

// Gestion du comportement sticky pour mobile
if (skillCardsTitle) {

  // Calculer les positions seuils à partir des variables CSS
  const getThresholdPositions = () => {
    const styles = getComputedStyle(document.documentElement);
    const headerH = parseInt(styles.getPropertyValue('--header-h'));
    const searchH = parseInt(styles.getPropertyValue('--search-h'));
    const spacing = parseInt(styles.getPropertyValue('--spacing'));

    return {
      cardsTop: headerH + searchH + (spacing * 3.5)
    };
  };

  handleScroll = () => {
    // Sur grand écran, réinitialiser
    if (window.innerWidth >= screenSmall) {
      if (skillCardsTitle.classList.contains('is-fixed')) {
        skillCardsTitle.classList.remove('is-fixed');
        skillCardsTitle.style.position = '';
        skillCardsTitle.style.top = '';
        skillCardsTitle.style.left = '';
        skillCardsTitle.style.width = '';
        skillCardsTitle.style.zIndex = '';
        if (cardsPlaceholder) {
          cardsPlaceholder.remove();
          cardsPlaceholder = null;
        }
      }
      return;
    }

    const thresholds = getThresholdPositions();
    const isCardsFixed = skillCardsTitle.classList.contains('is-fixed');

    // Gérer skillCardsTitle
    let cardsTop;
    if (cardsPlaceholder) {
      cardsTop = cardsPlaceholder.getBoundingClientRect().top;
    } else {
      cardsTop = skillCardsTitle.getBoundingClientRect().top;
    }

    const shouldCardsBeFixed = cardsTop <= thresholds.cardsTop;

    if (shouldCardsBeFixed && !isCardsFixed) {
      // Obtenir les dimensions avant de devenir fixed
      const rect = skillCardsTitle.getBoundingClientRect();

      // Créer un clone invisible pour maintenir l'espace
      cardsPlaceholder = skillCardsTitle.cloneNode(true);
      cardsPlaceholder.style.visibility = 'hidden';
      cardsPlaceholder.style.pointerEvents = 'none';
      cardsPlaceholder.className = cardsPlaceholder.className + ' cards-title-placeholder';
      skillCardsTitle.parentNode.insertBefore(cardsPlaceholder, skillCardsTitle);

      // Appliquer le positionnement fixed
      skillCardsTitle.classList.add('is-fixed');
      skillCardsTitle.style.position = 'fixed';
      skillCardsTitle.style.top = thresholds.cardsTop + 'px';
      skillCardsTitle.style.left = rect.left + 'px';
      skillCardsTitle.style.width = rect.width + 'px';
      skillCardsTitle.style.zIndex = '800';

    } else if (!shouldCardsBeFixed && isCardsFixed) {
      // Retirer le fixed
      skillCardsTitle.classList.remove('is-fixed');
      skillCardsTitle.style.position = '';
      skillCardsTitle.style.top = '';
      skillCardsTitle.style.left = '';
      skillCardsTitle.style.width = '';
      skillCardsTitle.style.zIndex = '';

      if (cardsPlaceholder) {
        cardsPlaceholder.remove();
        cardsPlaceholder = null;
      }
    }
  };

  // Gérer le redimensionnement de la fenêtre
  const handleResize = () => {
    // Si on passe en grand écran, nettoyer
    if (window.innerWidth >= screenSmall) {
      if (skillCardsTitle.classList.contains('is-fixed')) {
        skillCardsTitle.classList.remove('is-fixed');
        skillCardsTitle.style.position = '';
        skillCardsTitle.style.top = '';
        skillCardsTitle.style.left = '';
        skillCardsTitle.style.width = '';
        skillCardsTitle.style.zIndex = '';
      }
      if (cardsPlaceholder) {
        cardsPlaceholder.remove();
        cardsPlaceholder = null;
      }
    } else {
      // Recalculer les positions en mode mobile
      if (skillCardsTitle.classList.contains('is-fixed')) {
        const rect = cardsPlaceholder ? cardsPlaceholder.getBoundingClientRect() : skillCardsTitle.getBoundingClientRect();
        skillCardsTitle.style.left = rect.left + 'px';
        skillCardsTitle.style.width = rect.width + 'px';
      }
    }

    handleScroll();
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleResize);

  // Initialiser au chargement
  setTimeout(() => {
    handleScroll();
  }, 100);
}

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
      const styles = getComputedStyle(document.documentElement);
      const headerH = parseInt(styles.getPropertyValue('--header-h'));
      const searchH = parseInt(styles.getPropertyValue('--search-h'));
      const spacing = parseInt(styles.getPropertyValue('--spacing'));
      const cardsTop = headerH + searchH + (spacing * 3);

      // Obtenir la position actuelle de skillCardsTitle
      const rect = skillCardsTitle.getBoundingClientRect();
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

