const slug = require("slug");
const pandemonium = require("pandemonium");
const { sortBy, range, first, last } = require("lodash");

const remap = require("./remap.js");

exports.createNewSlug = function (uniqueSlugs, member) {
  let nameSlug = slug(member.firstName + " " + member.lastName);
  let counter = 0;

  while (uniqueSlugs.has(nameSlug)) {
    counter += 1;
    nameSlug = nameSlug + "-" + counter;
  }

  uniqueSlugs.add(nameSlug);
  return [nameSlug, uniqueSlugs];
};

exports.formatMembers = function (formItems) {
  const ranks = pandemonium.shuffle(range(formItems.length));
  let uniqueSlugs = new Set();

  cleanItems = formItems
    .map((item, index) => {
      let cleanItem = {};
      for (const key in item) {
        cleanItem[remap[key]] = item[key];
      }
      cleanItem.allSkillsArray = cleanItem.allSkills
        .split(",")
        .flatMap((item) => {
          let paths = [];
          const splittedPath = item.trim().split("/");
          for (let i = 0; i < splittedPath.length; i++) {
            paths.push(splittedPath.slice(0, i + 1).join("/"));
          }
          return paths;
        });
      cleanItem.lastSkillsArray = cleanItem.allSkillsArray.map((item) => {
        return last(item.split("/"));
      });

      cleanItem.firstSkillsArray = Array.from(
        new Set(
          cleanItem.allSkillsArray.map((item) => {
            return first(item.split("/"));
          })
        )
      );
      cleanItem.rank = ranks[index];
      cleanItem.keep = cleanItem.keep.toLowerCase() == "oui";
      return cleanItem;
    })
    .filter((item) => item.keep);

  sortedItems = sortBy(cleanItems, function (o) {
    return new Date(o.timestamp);
  });

  for (i = 0; i < sortedItems.length; i++) {
    const updatedSlugs = exports.createNewSlug(uniqueSlugs, sortedItems[i]);
    uniqueSlugs = updatedSlugs[1];
    sortedItems[i].slug = updatedSlugs[0];
  }

  return sortedItems;
};
