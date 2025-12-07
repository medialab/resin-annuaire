import "@medialab/resin-formulaire";

// Gestion de la validation visuelle du formulaire
document.addEventListener('DOMContentLoaded', () => {
  // Attendre que le webcomponent soit chargé
  setTimeout(() => {
    const form = document.querySelector('form#subscribe');
    console.log("Form trouvé:", form);

    if (form) {
      const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
      console.log("Nombre d'inputs trouvés:", inputs.length);

      // Écouter la tentative de soumission
      form.addEventListener('submit', (e) => {
        console.log("Submit intercepté");
        // Ajouter la classe pour activer les styles d'erreur
        form.classList.add('was-validated');

        // Si le formulaire est invalide, empêcher la soumission
        if (!form.checkValidity()) {
          e.preventDefault();
          e.stopPropagation();
          console.log("Formulaire invalide");

          // Ajouter manuellement une bordure rouge aux inputs invalides
          inputs.forEach(input => {
            console.log("Input:", input, "Valid:", input.validity.valid);
            if (!input.validity.valid) {
              input.style.border = '1px solid #e74c3c';
              input.style.borderColor = '#e74c3c';
              console.log("Bordure rouge appliquée à", input);
            }
          });
        }
      }, false);

      // Retirer la bordure rouge quand l'utilisateur corrige
      inputs.forEach(input => {
        input.addEventListener('input', () => {
          if (input.validity.valid) {
            input.style.border = '';
          }
        });
      });
    }
  }, 500);
});
