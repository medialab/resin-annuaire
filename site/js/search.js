import { sortBy } from "lodash";
import unidecode from "unidecode";

import loadJSON from "./loadMembers";
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
const $skillsSelector = document.querySelector("#skills-selector");
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
  console.log(query, selectedSkills);
  query = normalizeString(query);
  return members.filter((member) => {
    return (
      (!query ||
        normalizeString(member.firstName + " " + member.lastName).includes(
          query
        )) &&
      (!selectedSkills.size ||
        member.skillsArray.some((skill) => selectedSkills.has(skill)))
    );
  });
}

loadJSON(function (data) {
  MEMBERS = data;
  $skillsToggle.addEventListener("click", () => {
    if (SEARCH_STATE.skillsToggled) {
      $skillsSelector.style.display = "none";
      SEARCH_STATE.skillsToggled = false;
      $skillsToggle.textContent = "+";
    } else {
      $skillsSelector.style.display = "block";
      SEARCH_STATE.skillsToggled = true;
      $skillsToggle.textContent = "-";
    }
  });
  document.querySelectorAll("#skills-selector button").forEach((e) => {
    e.addEventListener("click", () => {
      const skill = e.textContent;
      if (!SEARCH_STATE.selectedSkills.has(skill)) {
        SEARCH_STATE.selectedSkills.add(skill);
        const $skillLabel = document.createElement("li");
        $skillLabel.textContent = skill;
        const $closeButton = document.createElement("button");
        $closeButton.textContent = "x";
        $skillLabel.appendChild($closeButton);
        $selectedSkillsUl.appendChild($skillLabel);
        updateSearchResults();
        $closeButton.addEventListener("click", () => {
          SEARCH_STATE.selectedSkills.delete(skill);
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
