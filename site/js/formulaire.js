import "@medialab/resin-formulaire";

// Gestion de la validation visuelle du formulaire
document.addEventListener("DOMContentLoaded", () => {
  // Attendre que le webcomponent soit chargé
  setTimeout(() => {
    const webComponent = document.querySelector("resin-formulaire");
    const shadowRoot = webComponent ? webComponent.shadowRoot : null;

    // Chercher le formulaire soit directement, soit dans le shadow DOM
    let form = document.querySelector("form#subscribe");

    if (!form && shadowRoot) {
      form = shadowRoot.querySelector("form#subscribe");
    }

    if (form) {
      const inputs = form.querySelectorAll(
        "input[required], select[required], textarea[required]",
      );

      // Écouter l'événement invalid sur chaque input (se déclenche quand la validation échoue)
      inputs.forEach((input) => {
        input.addEventListener(
          "invalid",
          () => {
            // Ajouter la classe pour l'input invalide
            input.classList.add("invalid-input");
          },
          true,
        );

        // Retirer la classe quand l'utilisateur corrige l'input
        input.addEventListener("input", () => {
          if (input.validity.valid) {
            input.classList.remove("invalid-input");
          }
        });
      });

      // Gestion de la modale de succès
      // Observer les changements dans le shadowRoot pour détecter l'ajout de la modale
      if (shadowRoot) {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              // Vérifier si le nœud ajouté est la modale de succès
              if (
                node.nodeType === 1 &&
                (node.id === "modal--success" ||
                  node.querySelector("#modal--success"))
              ) {
                const body = document.querySelector("body");
                const successModal =
                  shadowRoot.querySelector("#modal--success");

                if (successModal && body) {
                  body.classList.add("has-modal");

                  // Supprimer le bouton back-to-top
                  const backToTop = document.querySelector("#back-to-top");
                  if (backToTop) {
                    backToTop.remove();
                  }

                  // Ajouter l'event listener sur le bouton close
                  const closeButton = successModal.querySelector(".close");
                  if (closeButton) {
                    closeButton.addEventListener("click", () => {
                      body.classList.remove("has-modal");
                    });
                  }
                }
              }
            });
          });
        });

        // Observer le shadowRoot pour les ajouts de nœuds
        observer.observe(shadowRoot, {
          childList: true,
          subtree: true,
        });
      }
    }
  }, 1000);
});
