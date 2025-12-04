const toc = document.querySelector('.member__toc');

if (toc) {
  let tocInitialTop = null;
  let tocInitialLeft = null;
  let tocWidth = null;
  let tocHeight = null;

  const backToTop = toc.querySelector('.back-to-top');
  const footer = document.getElementById('site-footer');

  // Créer un placeholder pour éviter le saut
  const placeholder = document.createElement('div');
  placeholder.style.display = 'none';
  toc.parentNode.insertBefore(placeholder, toc);

  function initTocPosition() {
    toc.style.position = 'static';
    toc.style.top = 'auto';
    toc.style.left = 'auto';
    toc.style.width = 'auto';
    placeholder.style.display = 'none';

    const rect = toc.getBoundingClientRect();
    tocInitialTop = rect.top + window.scrollY;
    tocInitialLeft = rect.left;
    tocWidth = rect.width;
    tocHeight = rect.height;
  }

  function updateTocPosition() {
    const windowWidth = window.innerWidth;

    if (windowWidth > 800) {
      const headerHeight = parseInt(getComputedStyle(document.body).getPropertyValue('--header-h')) || 0;
      const scrollTop = window.scrollY;

      if (scrollTop >= tocInitialTop - headerHeight*2) {
        placeholder.style.display = 'block';
        placeholder.style.height = `${tocHeight}px`;
        toc.style.position = 'fixed';
        toc.style.top = `${headerHeight}px`;
        toc.style.left = `${tocInitialLeft}px`;
        toc.style.width = `${tocWidth}px`;
      } else {
        placeholder.style.display = 'none';
        toc.style.position = 'static';
        toc.style.top = 'auto';
        toc.style.left = 'auto';
        toc.style.width = 'auto';
      }
    } else {
      placeholder.style.display = 'none';
      toc.style.position = 'static';
      toc.style.top = 'auto';
      toc.style.left = 'auto';
      toc.style.width = 'auto';
    }
  }

  // Gestion de l'active state dans la navigation
  const sections = document.querySelectorAll('.content-section');
  const tocLinks = toc.querySelectorAll('li');

  function updateActiveSection() {
    const offset = 160;
    let currentSection = null;

    // Trouver la dernière section dont le top est passé
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();

      if (rect.top <= offset) {
        currentSection = section.id;
      }
    });

    // Toujours retirer la classe de tous les éléments d'abord
    tocLinks.forEach((li) => {
      li.classList.remove('is-selected');
    });

    // Ajouter la classe uniquement à la section active
    if (currentSection) {
      let found = false;
      tocLinks.forEach((li) => {
        const link = li.querySelector('a');
        if (link && link.getAttribute('href') === `#${currentSection}` && !found) {
          li.classList.add('is-selected');
          found = true;
        }
      });
    }
  }

  // Gestion du clic sur les liens du toc
  tocLinks.forEach((li) => {
    const link = li.querySelector('a');
    if (link) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
          const headerHeight = parseInt(getComputedStyle(document.body).getPropertyValue('--header-h')) || 0;
          const subHeaderHeight = parseInt(getComputedStyle(document.body).getPropertyValue('--subheader-h')) || 0;
          const targetPosition = targetSection.offsetTop - headerHeight*2;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }

        // Décocher la checkbox #input-toggle-menu si elle est cochée
        const inputToggleMenu = document.getElementById('input-toggle-menu');
        if (inputToggleMenu && inputToggleMenu.checked) {
          inputToggleMenu.checked = false;
        }
      });
    }
  });

  // Fonction pour ajuster le bottom de .back-to-top en fonction du footer (desktop uniquement)
  function adjustBackToTopPosition() {
    if (!backToTop || !footer) {
      return;
    }

    // Sur mobile, réinitialiser
    if (window.innerWidth <= 800) {
      backToTop.style.bottom = '';
      return;
    }

    const footerRect = footer.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Si le footer approche
    if (footerRect.top < windowHeight) {
      // Calculer de combien le footer dépasse dans la zone visible
      const overlap = windowHeight - footerRect.top;
      const pushUp = Math.max(0, overlap);
      backToTop.style.bottom = `${pushUp}px`;
    } else {
      // Footer loin, position par défaut
      backToTop.style.bottom = '0px';
    }
  }

  initTocPosition();
  adjustBackToTopPosition();

  window.addEventListener('scroll', () => {
    updateTocPosition();
    updateActiveSection();
    adjustBackToTopPosition();
  });
  window.addEventListener('resize', () => {
    initTocPosition();
    updateTocPosition();
    adjustBackToTopPosition();
  });
  updateTocPosition();
  updateActiveSection();
}





const btnContact = document.querySelector('#btn-contact');
const btnCopy = document.getElementById("contact__copy");
const emailElement = document.getElementById("contact");


if(btnContact){
  btnContact.addEventListener("click", function(event) {
    let mail = document.querySelector("#contact");
    mail.innerHTML = mail.innerHTML.replace("¤", "@");
  });
}


if (btnCopy && emailElement) {
  btnCopy.addEventListener("click", () => {
    const email = emailElement.textContent.replace("¤", "@");
    const successMessage = document.querySelector('#contact__group .success');

    navigator.clipboard.writeText(email).then(() => {
        successMessage.style.display = 'block';

        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 1000);
    });
  });
}


// Copier .member__toc dans #site-nav quand le menu est ouvert
const inputToggleMenu = document.getElementById('input-toggle-menu');
const siteNav = document.getElementById('site-nav');
const memberToc = document.querySelector('.member__toc');

console.log('inputToggleMenu:', inputToggleMenu);
console.log('siteNav:', siteNav);
console.log('memberToc:', memberToc);

if (inputToggleMenu && siteNav && memberToc) {
  console.log('Tous les éléments trouvés, ajout du listener');

  inputToggleMenu.addEventListener('change', function() {
    console.log('Change event déclenché, checked:', this.checked);

    // Si la checkbox est cochée (menu ouvert)
    if (this.checked) {
      // Vérifier si .member__toc n'existe pas déjà dans #site-nav
      const existingToc = siteNav.querySelector('.member__toc');
      console.log('existingToc:', existingToc);

      if (!existingToc) {
        // Récupérer et cloner le h2 de .member__header .title-group
        const memberTitle = document.querySelector('.member__header .title-group h2');
        if (memberTitle) {
          const titleClone = memberTitle.cloneNode(true);
          titleClone.classList.add('title-nav');
          siteNav.appendChild(titleClone);
          console.log('Titre cloné et ajouté dans site-nav');
        }

        // Cloner .member__toc et l'ajouter dans #site-nav
        const tocClone = memberToc.cloneNode(true);
        siteNav.appendChild(tocClone);
        console.log('TOC cloné et ajouté dans site-nav');

        // Ajouter les event listeners aux liens du TOC cloné
        const clonedLinks = tocClone.querySelectorAll('li');
        clonedLinks.forEach((li) => {
          const link = li.querySelector('a');
          if (link) {
            link.addEventListener('click', (e) => {
              e.preventDefault();
              const targetId = link.getAttribute('href').substring(1);
              const targetSection = document.getElementById(targetId);

              if (targetSection) {
                const headerHeight = parseInt(getComputedStyle(document.body).getPropertyValue('--header-h')) || 0;
                const targetPosition = targetSection.offsetTop - headerHeight*2;

                window.scrollTo({
                  top: targetPosition,
                  behavior: 'smooth'
                });
              }

              // Décocher la checkbox #input-toggle-menu
              if (inputToggleMenu && inputToggleMenu.checked) {
                inputToggleMenu.checked = false;
              }
            });
          }
        });
      } else {
        console.log('TOC existe déjà dans site-nav');
      }
    }
  }, false);
} else {
  console.log('Certains éléments manquent');
}