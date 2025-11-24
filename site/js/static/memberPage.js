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

  initTocPosition();
  window.addEventListener('scroll', updateTocPosition);
  window.addEventListener('resize', () => {
    initTocPosition();
    updateTocPosition();
  });
  updateTocPosition();
}
