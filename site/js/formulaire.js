import "@medialab/resin-formulaire";

// Gestion de la validation visuelle du formulaire
document.addEventListener('DOMContentLoaded', () => {
  // Attendre que le webcomponent soit chargé
  setTimeout(() => {
    const webComponent = document.querySelector('resin-formulaire');
    const shadowRoot = webComponent ? webComponent.shadowRoot : null;

    // Chercher le formulaire soit directement, soit dans le shadow DOM
    let form = document.querySelector('form#subscribe');

    if (!form && shadowRoot) {
      form = shadowRoot.querySelector('form#subscribe');
    }

    if (form) {
      const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');

      // Écouter l'événement invalid sur chaque input (se déclenche quand la validation échoue)
      inputs.forEach(input => {
        input.addEventListener('invalid', () => {
          // Ajouter la classe pour l'input invalide
          input.classList.add('invalid-input');
        }, true);

        // Retirer la classe quand l'utilisateur corrige l'input
        input.addEventListener('input', () => {
          if (input.validity.valid) {
            input.classList.remove('invalid-input');
          }
        });
      });
    }
  }, 1000);
});
