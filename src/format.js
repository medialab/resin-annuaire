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

exports.formatMembers = function (formItems, idToLabel) {
  const ranks = pandemonium.shuffle(range(formItems.length));
  let uniqueSlugs = new Set();

  cleanItems = formItems.map((item, index) => {
    let cleanItem = {};
    for (const key in item) {
      cleanItem[remap[key]] = item[key];
    }

    cleanItem.lastSkills = cleanItem.allSkills
      .map((item) => {
        return idToLabel.get(item).label;
      })
      .join(", ");

    cleanItem.firstSkillsSet = new Set(
      cleanItem.allSkills.map((item) => {
        return idToLabel.get(idToLabel.get(item).path[0]).label;
      }),
    );
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

exports.formatSkills = function (fieldsTree, skillsTree) {
  const idToLabel = new Map();
  const labelToId = new Map(
    Object.entries({
      fields: {},
      skills: {},
      details: {},
    }),
  );
  fieldsTree.forEach((obj) => {
    idToLabel.set(obj.id, { path: [obj.id], label: obj.field });
    labelToId.get("fields")[obj.field] = obj.id;
  });
  skillsTree.forEach((obj) => {
    if (obj.detail) {
      labelToId.get("details")[obj.detail] = obj.id;
    }
    if (obj.skill) {
      if (!idToLabel.has(obj.id)) {
        parentId = labelToId.get("fields")[obj.field];
        idToLabel.set(obj.id, {
          path: [parentId, obj.id],
          label: obj.skill,
        });
        labelToId.get("skills")[obj.skill] = obj.id;
      }
    }
  });
  skillsTree.forEach((obj) => {
    if (obj.detail) {
      grandParentId = labelToId.get("fields")[obj.field];
      parentId = labelToId.get("skills")[obj.skill];
      idToLabel.set(obj.id, {
        path: [grandParentId, parentId, obj.id],
        label: obj.detail,
      });
    }
  });
  return idToLabel;
};
