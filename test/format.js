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
  },
  {
    Horodateur: "28/07/2023 11:05:23",
    Prénom: "Second",
    Nom: "Member",
  },
];

describe("Members", function () {
  describe("uniqueSlugs", function () {
    it("should add numerical suffix if slug already exists", function () {
      const updatedSlugs = createNewSlug(existingSlugs, duplicateName);
      assert.equal(updatedSlugs[0], "first-member-1");
    });
  });
  describe("formattedMembers", function () {
    it("should remap field names, add rank and slug", function () {
      const formattedMembers = formatMembers(formInput);
      for (formattedMember of formattedMembers) {
        assert(Number.isInteger(formattedMember.rank));
        assert("slug" in formattedMember);
        assert("timestamp" in formattedMember);
      }
    });
  });
});
