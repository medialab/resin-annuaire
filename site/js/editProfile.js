import "@medialab/resin-formulaire";

let MODAL_OPENED = false;
const $modal = document.querySelector(".modal-content");
const $modalBackground = document.querySelector(".modal-background");

const $editButton = document.querySelector("#edit-button");
const $span = document.querySelector(".close");

function openModal() {
  $modal.style.display = "block";
  $modalBackground.style.display = "block";
  MODAL_OPENED = true;
}

function closeModal() {
  $modal.style.display = "none";
  $modalBackground.style.display = "none";
  MODAL_OPENED = false;
}

$editButton.onclick = function () {
  openModal();
};

$modalBackground.onclick = function (event) {
  if (MODAL_OPENED && event.target !== $modal) {
    closeModal();
  }
};

$span.onclick = function () {
  closeModal();
};
