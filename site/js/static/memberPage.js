const toc = document.querySelector('.member__toc');

if (toc) {
  let tocInitialTop = null;
  let tocInitialLeft = null;
  let tocWidth = null;
  let tocHeight = null;

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
          const targetPosition = targetSection.offsetTop - headerHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    }
  });

  initTocPosition();
  window.addEventListener('scroll', () => {
    updateTocPosition();
    updateActiveSection();
  });
  window.addEventListener('resize', () => {
    initTocPosition();
    updateTocPosition();
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