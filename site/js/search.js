import loadJSON from "./loadMembers";

const searchInput = document.querySelector(".input");

function clearList(list) {
  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }
}

function setList(searchResults) {
  const grid = document.querySelector(".cardsWrapper");
  clearList(grid);

  for (const person of searchResults) {
    const resultItem = document.createElement("div");
    resultItem.className = "card";
    resultItem.textContent = person.firstName + " " + person.lastName;
    resultItem.onclick = function () {
      location.href = person.slug;
    };
    grid.appendChild(resultItem);
  }
}

function searchPerson(value) {
  return function (person) {
    return (
      person.firstName.toLowerCase().includes(value) ||
      person.lastName.toLowerCase().includes(value)
    );
  };
}

loadJSON(function (response) {
  const members = JSON.parse(response);

  searchInput.addEventListener("input", (e) => {
    let value = e.target.value;
    value = value.trim().toLowerCase();
    setList(members.filter(searchPerson(value)));
  });
});
