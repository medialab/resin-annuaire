import { sortBy } from "lodash";
import unidecode from "unidecode";

import { loadJSON } from "./loadMembers";
import ResinFormulaire from "@medialab/resin-formulaire";
import cardsTemplate from "../templates/cards.html";

const SEARCH_STATE = {
  query: "",
  skillsToggled: false,
  selectedSkill: "",
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
    SEARCH_STATE.selectedSkill
  );
  $grid.innerHTML = cardsTemplate({
    items: sortBy(searchResults, ["rank"]),
  });
}

function normalizeString(string) {
  return unidecode(string.trim().toLowerCase());
}

function changeOpacity(event, value) {
  const path = event.target.closest(".skills-selector").dataset.path;
  document.querySelectorAll(".skills-selector").forEach((e) => {
    if (!e.dataset.path.startsWith(path)) {
      e.style.opacity = value;
    } else {
      e.style.opacity = "1";
    }
  });
}

function lowerOpacity(event) {
  changeOpacity(event, "0.5");
}

function restoreOpacity(event) {
  changeOpacity(event, "1");
}

function shineOnHover(e) {
  e.addEventListener("mouseenter", lowerOpacity);
  e.addEventListener("mouseleave", restoreOpacity);
}

function dontShineOnHover(e) {
  e.removeEventListener("mouseenter", lowerOpacity);
  e.removeEventListener("mouseleave", restoreOpacity);
}

function searchPeople(members, query, selectedSkill) {
  query = normalizeString(query);
  return members.filter((member) => {
    return (
      (!query ||
        normalizeString(member.firstName + " " + member.lastName).includes(
          query
        ) ||
        normalizeString(member.lastSkills).includes(query) ||
        normalizeString(member.organization).includes(query)) &&
      (!selectedSkill || member.allSkills.includes(selectedSkill))
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
  document.querySelectorAll(".skills-selector").forEach((e) => {
    shineOnHover(e);
    e.addEventListener("click", (event) => {
      const path = event.target.closest(".skills-selector").dataset.path;
      if (SEARCH_STATE.selectedSkill !== path) {
        SEARCH_STATE.selectedSkill = path;
        lowerOpacity(event);
        updateSearchResults();

        document.querySelectorAll(".skills-selector").forEach((e) => {
          dontShineOnHover(e);
        });
      } else {
        restoreOpacity(event);
        SEARCH_STATE.selectedSkill = "";
        updateSearchResults();

        document.querySelectorAll(".skills-selector").forEach((e) => {
          shineOnHover(e);
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
