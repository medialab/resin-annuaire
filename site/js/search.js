import { sortBy } from "lodash";
import unidecode from "unidecode";

import loadJSON from "./loadMembers";
import cardsTemplate from "../templates/cards.html";

const searchInput = document.querySelector(".input");
const grid = document.querySelector(".cardsWrapper");

function setList(searchResults) {
  grid.innerHTML = cardsTemplate({
    items: sortBy(searchResults, ["rank"]),
  });
}

function normalizeString(string) {
  return unidecode(string.trim().toLowerCase());
}

function searchPerson(value) {
  return function (person) {
    return (
      normalizeString(person.firstName).includes(value) ||
      normalizeString(person.lastName).includes(value)
    );
  };
}

loadJSON(function (response) {
  const members = JSON.parse(response);

  searchInput.addEventListener("input", (e) => {
    let value = e.target.value;
    value = normalizeString(value);
    setList(members.filter(searchPerson(value)));
  });
});
