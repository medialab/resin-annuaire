const assert = require("assert");

const { createNewSlug, formatMembers } = require("../src/format.js");

const existingSlugs = new Set(["first-member", "second-member"]);

const duplicateName = {
  firstName: "first",
  lastName: "member",
};

const formInput = [
  {
    Horodateur: "21/07/2023 16:17:14",
    Prénom: "First",
    Nom: "Member",
    "À afficher dans l'annuaire": "Oui",
    "Domaine d'expertise": "Analyse de données",
  },
  {
    Horodateur: "28/07/2023 11:05:23",
    Prénom: "Second",
    Nom: "Member",
    "À afficher dans l'annuaire": "oui",
    "Domaine d'expertise":
      "Collecte de données, Visualisation de données, Analyse de données",
  },
  {
    Horodateur: "24/08/2023 10:48:12",
    Prénom: "Third",
    Nom: "Member",
    "À afficher dans l'annuaire": "",
    "Domaine d'expertise": "Visualisation de données",
  },
];

describe("Members", function () {
  describe("uniqueSlugs", function () {
    it("should add numerical suffix if slug already exists", function () {
      const updatedSlugs = createNewSlug(existingSlugs, duplicateName);
      assert.equal(updatedSlugs[0], "first-member-1");
    });
  });
  const formattedMembers = formatMembers(formInput);
  describe("formattedMembers", function () {
    it("should remap field names, add rank and slug", function () {
      for (formattedMember of formattedMembers) {
        assert(Number.isInteger(formattedMember.rank));
        assert("slug" in formattedMember);
        assert("timestamp" in formattedMember);
      }
    });
  });
  describe("filterMembers", function () {
    it("should filter members if 'À afficher dans l'annuaire' is not 'oui'", function () {
      assert.equal(formattedMembers.length, 2);
    });
  });
});
