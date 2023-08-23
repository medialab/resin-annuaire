import { sortBy } from "lodash";
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
