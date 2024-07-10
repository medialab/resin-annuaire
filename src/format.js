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

exports.formatMembers = function (formItems, idToLanguage, idToLabel) {
  const ranks = pandemonium.shuffle(range(formItems.length));
  let uniqueSlugs = new Set();

  cleanItems = formItems.map((item, index) => {
    let cleanItem = {};
    for (const key in item) {
      cleanItem[remap[key]] = item[key];
    }

    cleanItem.lastSkills = cleanItem.allSkills
      .map((item) => {
        return idToLabel[item].label;
      })
      .join(", ");

    cleanItem.firstSkillsSet = new Set(
      cleanItem.allSkills.map((item) => {
        return idToLabel[idToLabel[item].path[0]].label;
      }),
    );

    let skillSet = new Set();
    cleanItem.allSkills.forEach((item) => {
      const path = idToLabel[item].path;
      path.forEach((id) => skillSet.add(id));
    });
    cleanItem.allSkills = Array.from(skillSet);

    cleanItem.languages = cleanItem.languages.map((lang) => {
      return idToLanguage[lang];
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

exports.formatLanguages = function (languagesJson) {
  const idToLanguages = {};
  languagesJson.forEach((obj) => {
    idToLanguages[obj.pt2b] = obj.name;
  });
  return idToLanguages;
};

exports.formatSkills = function (fieldsTree, skillsTree) {
  const idToLabel = {};
  const labelToId = {
    fields: {},
    skills: {},
    details: {},
  };
  fieldsTree.forEach((obj) => {
    idToLabel[obj.id] = { path: [obj.id], label: obj.field };
    labelToId["fields"][obj.field] = obj.id;
  });
  skillsTree.forEach((obj) => {
    if (!obj.detail) {
      if (!(obj.id in idToLabel)) {
        parentId = labelToId["fields"][obj.field];
        idToLabel[obj.id] = {
          path: [parentId, obj.id],
          label: obj.skill,
        };
        labelToId["skills"][obj.skill] = obj.id;
      }
    }
  });
  skillsTree.forEach((obj) => {
    if (obj.detail) {
      labelToId["details"][obj.detail] = obj.id;
      grandParentId = labelToId["fields"][obj.field];
      parentId = labelToId["skills"][obj.skill];
      idToLabel[obj.id] = {
        path: [grandParentId, parentId, obj.id],
        label: obj.detail,
      };
    }
  });
  return idToLabel;
};
