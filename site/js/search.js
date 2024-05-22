import { sortBy } from "lodash";
import unidecode from "unidecode";

import { loadJSON } from "./loadMembers";
import cardsTemplate from "../templates/cards.html";

const SEARCH_STATE = {
  query: "",
  skillsToggled: false,
  selectedSkills: new Set(),
};

let MEMBERS = null;

const $searchInput = document.querySelector(".input");
const $grid = document.querySelector(".cardsWrapper");
const $skillsToggle = document.querySelector("#skills-toggle");
const $searchTable = document.querySelector(".search-table");
const $selectedSkillsUl = document.querySelector("#selected-skills");

function updateSearchResults() {
  const searchResults = searchPeople(
    MEMBERS,
    SEARCH_STATE.query,
    SEARCH_STATE.selectedSkills
  );
  $grid.innerHTML = cardsTemplate({
    items: sortBy(searchResults, ["rank"]),
  });
}

function normalizeString(string) {
  return unidecode(string.trim().toLowerCase());
}

function searchPeople(members, query, selectedSkills) {
  query = normalizeString(query);
  return members.filter((member) => {
    return (
      (!query ||
        normalizeString(member.firstName + " " + member.lastName).includes(
          query
        )) &&
      (!selectedSkills.size ||
        member.allSkillsArray.some((skill) => selectedSkills.has(skill)))
    );
  });
}

loadJSON(function (data) {
  MEMBERS = data;
  $skillsToggle.addEventListener("click", () => {
    if (SEARCH_STATE.skillsToggled) {
      $searchTable.style.display = "none";
      SEARCH_STATE.skillsToggled = false;
      $skillsToggle.textContent = "+";
    } else {
      $searchTable.style.display = "flex";
      SEARCH_STATE.skillsToggled = true;
      $skillsToggle.textContent = "-";
    }
  });
  document.querySelectorAll("#skills-selector").forEach((e) => {
    e.addEventListener("click", () => {
      const skill = e.textContent;
      const path = e.dataset.path;
      if (!SEARCH_STATE.selectedSkills.has(path)) {
        SEARCH_STATE.selectedSkills.add(path);
        const $skillLabel = document.createElement("li");
        $skillLabel.textContent = skill;
        const $closeButton = document.createElement("button");
        $closeButton.textContent = "x";
        $skillLabel.appendChild($closeButton);
        $selectedSkillsUl.appendChild($skillLabel);
        updateSearchResults();
        $closeButton.addEventListener("click", () => {
          SEARCH_STATE.selectedSkills.delete(path);
          $selectedSkillsUl.removeChild($skillLabel);
          updateSearchResults();
        });
      }
    });
  });
  $searchInput.addEventListener("input", (e) => {
    let value = e.target.value;
    SEARCH_STATE.query = value;
    updateSearchResults();
  });
});
