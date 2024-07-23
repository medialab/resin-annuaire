import "@medialab/resin-formulaire";

const $modal = document.querySelector(".modal-content");
const $modalBackground = document.querySelector(".modal-background");
const $contactButton = document.querySelector("#contact-button");
const $contactInfo = document.querySelector(".contact-info");
const $editButton = document.querySelector("#edit-button");
const $span = document.querySelector(".close");

function openModal() {
  $modal.style.display = "block";
  $modalBackground.style.display = "block";
}

function closeModal() {
  $modal.style.display = "none";
  $modalBackground.style.display = "none";
}

if ($contactButton) {
  $contactButton.onclick = function () {
    $contactInfo.textContent = $contactInfo.textContent.replace("¤", "@");
    $contactInfo.style.display = "inline";
  };
}

$editButton.onclick = openModal;

$modalBackground.onclick = function (event) {
  if (event.target !== $modal && event.target !== $contactButton) {
    closeModal();
  }
};

$span.onclick = closeModal;
