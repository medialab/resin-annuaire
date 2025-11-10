import { sortBy } from "lodash";
import unidecode from "unidecode";

import { loadJSON } from "./loadMembers";
import cardsTemplate from "../templates/cards.html";

const SEARCH_STATE = {
  query: "",
  skillsToggled: false,
  selectedSkill: "",
  frozen: false,
};

let MEMBERS = null;
let $searchInput, $grid, $skillsToggle, $searchTable, $container;

function updateSearchResults() {
  const searchResults = searchPeople(
    MEMBERS,
    SEARCH_STATE.query,
    SEARCH_STATE.selectedSkill,
  );
  $grid.innerHTML = cardsTemplate({
    items: sortBy(searchResults, ["rank"]),
  });
}

function normalizeString(string) {
  return unidecode(string.trim().toLowerCase());
}

function lowerOpacity(event) {
  if (!SEARCH_STATE.frozen) {
    const path = event.target.closest(".skills-selector").dataset.path;
    $searchTable.querySelectorAll(".skills-selector").forEach((e) => {
      if (!e.dataset.path.startsWith(path)) {
        e.style.opacity = 0.5;
      } else {
        e.style.opacity = "1";
      }
    });
  }
}

function restoreOpacity() {
  if (!SEARCH_STATE.frozen) {
    $searchTable.querySelectorAll(".skills-selector").forEach((e) => {
      e.style.opacity = "1";
    });
  }
}

function unfreeze() {
  SEARCH_STATE.frozen = false;
  SEARCH_STATE.selectedSkill = "";
  restoreOpacity();
  updateSearchResults();
}

function shineOnHover(e) {
  e.addEventListener("mouseenter", lowerOpacity);
  e.addEventListener("mouseleave", restoreOpacity);
}

function searchPeople(members, query, selectedSkill) {
  query = normalizeString(query);
  return members.filter((member) => {
    return (
      (!query ||
        normalizeString(member.firstName + " " + member.lastName).includes(
          query,
        ) ||
        normalizeString(member.lastSkills).includes(query) ||
        normalizeString(member.organization).includes(query)) &&
      (!selectedSkill || member.allSkills.includes(selectedSkill))
    );
  });
}

loadJSON(function (data) {
  MEMBERS = data;

  // Initialize DOM selectors
  $searchInput = document.querySelector(".input");
  $grid = document.querySelector(".cards-wrapper");
  $skillsToggle = document.querySelector("#skills-toggle");
  $searchTable = document.querySelector(".search-table");
  $container = document.querySelector(".container");

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

  $searchTable.querySelectorAll(".skills-selector").forEach((e) => {
    shineOnHover(e);
  });

  $container.addEventListener("click", (event) => {
    if (
      !event.target.closest(".search-table") &&
      !event.target.closest(".search-line")
    ) {
      unfreeze();
    } else {
      const selectedSkill = parseInt(
        event.target.closest(".skills-selector").dataset.path.split("/").at(-2),
      );
      if (SEARCH_STATE.selectedSkill !== selectedSkill) {
        SEARCH_STATE.frozen = false;
        lowerOpacity(event);
        SEARCH_STATE.selectedSkill = selectedSkill;
        updateSearchResults();
        SEARCH_STATE.frozen = true;
      } else {
        unfreeze();
      }
    }
  });

  $searchInput.addEventListener("input", (e) => {
    let value = e.target.value;
    SEARCH_STATE.query = value;
    updateSearchResults();
  });
});
