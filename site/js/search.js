import loadJSON from "./loadMembers";

const searchInput = document.querySelector(".input");

function clearList(list) {
  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }
}

function setList(searchResults) {
  const ul = document.querySelector("ul");
  clearList(ul);

  for (const person of searchResults) {
    const resultItem = document.createElement("li");

    const a = document.createElement("a");
    a.href = person.slug;
    a.innerHTML = person.firstName + " " + person.lastName;

    resultItem.appendChild(a);
    ul.appendChild(resultItem);
  }
}

loadJSON(function (response) {
  const members = JSON.parse(response);

  searchInput.addEventListener("input", (e) => {
    let value = e.target.value;
    if (value && value.trim().length > 0) {
      value = value.trim().toLowerCase();
      setList(
        members.filter((person) => {
          return person.firstName.toLowerCase().includes(value);
        })
      );
    }
  });
});
