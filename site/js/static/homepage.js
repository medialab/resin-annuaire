const skillTree = document.querySelector("#section__skills-tree");
const skillTreeTitle = document.querySelector("#section__skills-tree .section--title");

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
      cardsTop: headerH + searchH + (spacing * 3)
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


// const countMembers = document.getElementById('count-members');

// if (countMembers) {
//   let placeholder = null;
//   let initialOffset = null;


//   // Calculer la position seuil a partir des variables CSS
//   const getThresholdPosition = () => {
//     const styles = getComputedStyle(document.documentElement);
//     const headerH = parseInt(styles.getPropertyValue('--header-h'));
//     const searchH = parseInt(styles.getPropertyValue('--search-h'));
//     const spacing = parseInt(styles.getPropertyValue('--spacing'));
//     const result = headerH + searchH;
//     return result;
//   };

//   // Calculer la position initiale de l'element par rapport au document
//   const getInitialOffset = () => {
//     if (placeholder) {
//       return placeholder.offsetTop;
//     }
//     return countMembers.offsetTop;
//   };

//   const handleScroll = () => {
//     // Sur grand ecran, reinitialiser
//     if (window.innerWidth >= screenSmall) {
//       if (countMembers.classList.contains('is-fixed')) {
//         countMembers.classList.remove('is-fixed');
//         countMembers.style.position = '';
//         countMembers.style.top = '';
//         countMembers.style.left = '';
//         countMembers.style.width = '';
//         countMembers.style.zIndex = '';
//         if (placeholder) {
//           placeholder.remove();
//           placeholder = null;
//         }
//         initialOffset = null;
//       }
//       return;
//     }

//     const threshold = getThresholdPosition();
//     const isFixed = countMembers.classList.contains('is-fixed');

//     // Utiliser la position actuelle de l'element (ou du placeholder)
//     let elementTop;
//     if (placeholder) {
//       elementTop = placeholder.getBoundingClientRect().top;
//     } else {
//       elementTop = countMembers.getBoundingClientRect().top;
//     }

//     const shouldBeFixed = elementTop <= threshold;

//     console.log('[Homepage] Scroll check:', {
//       screenWidth: window.innerWidth,
//       elementTop,
//       threshold,
//       shouldBeFixed,
//       isFixed
//     });

//     if (shouldBeFixed && !isFixed) {
//       // Obtenir les dimensions avant de devenir fixed
//       const rect = countMembers.getBoundingClientRect();
//       const styles = getComputedStyle(countMembers);

//       // Creer un placeholder pour eviter le saut de layout
//       placeholder = document.createElement('div');
//       placeholder.style.height = rect.height + 'px';
//       placeholder.style.marginBottom = styles.marginBottom;
//       placeholder.className = 'count-members-placeholder';
//       countMembers.parentNode.insertBefore(placeholder, countMembers);

//       // Appliquer le positionnement fixed
//       countMembers.classList.add('is-fixed');
//       countMembers.style.position = 'fixed';
//       countMembers.style.top = threshold + 'px';
//       countMembers.style.left = rect.left + 'px';
//       countMembers.style.width = rect.width + 'px';
//       countMembers.style.zIndex = '800';

//     } else if (!shouldBeFixed && isFixed) {
//       // Retirer le fixed
//       countMembers.classList.remove('is-fixed');
//       countMembers.style.position = '';
//       countMembers.style.top = '';
//       countMembers.style.left = '';
//       countMembers.style.width = '';
//       countMembers.style.zIndex = '';

//       if (placeholder) {
//         placeholder.remove();
//         placeholder = null;
//       }
//     }
//   };

//   // Gerer le redimensionnement de la fenetre
//   const handleResize = () => {
//     // Reinitialiser l'offset pour recalculer
//     initialOffset = null;

//     // Si on passe en grand ecran, nettoyer
//     if (window.innerWidth >= screenSmall && placeholder) {
//       countMembers.classList.remove('is-fixed');
//       countMembers.style.position = '';
//       countMembers.style.top = '';
//       countMembers.style.left = '';
//       countMembers.style.width = '';
//       countMembers.style.zIndex = '';
//       placeholder.remove();
//       placeholder = null;
//     } else if (window.innerWidth < screenSmall && countMembers.classList.contains('is-fixed')) {
//       // Recalculer la position et largeur en mode fixed
//       const rect = placeholder ? placeholder.getBoundingClientRect() : countMembers.getBoundingClientRect();
//       countMembers.style.left = rect.left + 'px';
//       countMembers.style.width = rect.width + 'px';
//     }

//     handleScroll();
//   };

//   window.addEventListener('scroll', handleScroll, { passive: true });
//   window.addEventListener('resize', handleResize);

//   // Initialiser au chargement
//   setTimeout(() => {
//     initialOffset = getInitialOffset();
//     handleScroll();
//   }, 100);
// }



