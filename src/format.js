const pandemonium = require("pandemonium");
const { range } = require("lodash");

const remap = require("./remap.js");

exports.formatMembers = function (formItems, idToLanguage, idToLabel) {
  let genderCounter = 0;
  formItems.forEach((item) => {
    if (item.gender == "M") {
      genderCounter += 1;
    }
  });
  const ranks = pandemonium.shuffle(range(formItems.length - genderCounter));
  const ranksM = pandemonium.shuffle(
    range(formItems.length - genderCounter, formItems.length),
  );
  genderCounter = 0;
  cleanItems = formItems.map((item, index) => {
    if (item.gender == "M") {
      item.rank = ranksM[genderCounter];
      genderCounter += 1;
    } else {
      item.rank = ranks[index - genderCounter];
    }
    delete item.gender;

    let cleanItem = {};
    for (const key in item) {
      cleanItem[remap[key]] = item[key];
    }

    cleanItem.lastSkills = cleanItem.allSkills
      .map((item) => {
        return idToLabel[item].label;
      })
      .join(", ");

    cleanItem.firstSkills = Array.from(
      new Set(
        cleanItem.allSkills.map((item) => {
          return idToLabel[idToLabel[item].path[0]].label;
        }),
      ),
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

    return cleanItem;
  });

  return cleanItems;
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
