import { sortBy } from "lodash";
import unidecode from "unidecode";
import { Environment, PrecompiledLoader } from "nunjucks";

import loadJSON from "./loadMembers";
import templates from "./templates";

const env = new Environment(new PrecompiledLoader(templates));
const cards = env.getTemplate("cards.html");

const searchInput = document.querySelector(".input");
const grid = document.querySelector(".cardsWrapper");

function setList(searchResults) {
  grid.innerHTML = cards.render({
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
