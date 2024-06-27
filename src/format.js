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

exports.formatMembers = function (formItems, skillsMap) {
  const ranks = pandemonium.shuffle(range(formItems.length));
  let uniqueSlugs = new Set();

  cleanItems = formItems.map((item, index) => {
    let cleanItem = {};
    for (const key in item) {
      cleanItem[remap[key]] = item[key];
    }

    cleanItem.lastSkills = cleanItem.allSkills
      .map((item) => {
        return last(skillsMap.get(item));
      })
      .join(", ");

    cleanItem.firstSkillsArray = cleanItem.allSkills.map((item) => {
      return first(skillsMap.get(item));
    });
    cleanItem.rank = ranks[index];
    return cleanItem;
  });

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
