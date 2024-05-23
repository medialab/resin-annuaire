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
const $grid = document.querySelector(".cards-wrapper");
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

function changeOpacity(event, value) {
  const path = event.target.dataset.path;
  document.querySelectorAll("#skills-selector").forEach((e) => {
    if (!e.dataset.path.startsWith(path)) {
      e.style.opacity = value;
    }
  });
}

function lowerOpacity(event) {
  changeOpacity(event, "0.5");
}

function restoreOpacity(event) {
  changeOpacity(event, "1");
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
    e.addEventListener("mouseenter", lowerOpacity);
    e.addEventListener("mouseleave", restoreOpacity);
    e.addEventListener("click", (event) => {
      const skill = event.target.textContent;
      const path = event.target.dataset.path;
      if (!SEARCH_STATE.selectedSkills.has(path)) {
        SEARCH_STATE.selectedSkills.add(path);
        lowerOpacity(event);
        updateSearchResults();
        document.querySelectorAll("#skills-selector").forEach((e) => {
          e.removeEventListener("mouseenter", lowerOpacity);
          e.removeEventListener("mouseleave", restoreOpacity);
        });
      } else {
        restoreOpacity(event);
        SEARCH_STATE.selectedSkills.delete(path);
        document.querySelectorAll("#skills-selector").forEach((e) => {
          e.addEventListener("mouseenter", lowerOpacity);
          e.addEventListener("mouseleave", restoreOpacity);
        });
        updateSearchResults();
      }
    });
  });
  $searchInput.addEventListener("input", (e) => {
    let value = e.target.value;
    SEARCH_STATE.query = value;
    updateSearchResults();
  });
});
