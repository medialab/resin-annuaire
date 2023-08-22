import { sortBy } from "lodash";
import { Environment, WebLoader } from "nunjucks";

import loadJSON from "./loadMembers";

const searchInput = document.querySelector(".input");

const env = new Environment(new WebLoader("/templates"));
const cards = env.getTemplate("cards.html");

function setList(searchResults) {
  const grid = document.querySelector(".cardsWrapper");
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
