function findCategoryMetadata(tree, members, palette) {
  let categories = [];
  let subcategories = [];
  let subsubcategories = [];

  let memberCounts = {};

  for (const member of members) {
    let memberCategories = [new Set(), new Set(), new Set()];
    for (const skill of member.allSkillsArray) {
      if (!(skill in memberCounts)) {
        memberCounts[skill] = 0;
      }
      memberCategories[skill.split("/").length - 1].add(skill);
    }
    for (skillSet of memberCategories) {
      for (skill of skillSet) {
        memberCounts[skill] += 1;
      }
    }
  }

  for (const [key0, object0] of Object.entries(tree)) {
    categories.push({
      label: key0,
      path: key0,
      height: memberCounts[key0],
      color: palette[key0],
    });

    for (const [key1, leaf] of Object.entries(object0)) {
      const path = key0 + "/" + key1;
      if (memberCounts[path]) {
        subcategories.push({
          label: key1,
          path: path,
          height: memberCounts[path] || 0,
          color: palette[key0],
        });
      }
      if (leaf) {
        for (const key2 of leaf) {
          const path = key0 + "/" + key1 + "/" + key2;
          if (memberCounts[path]) {
            subsubcategories.push({
              label: key2,
              path: path,
              height: memberCounts[path] || 0,
              color: palette[key0],
            });
          }
        }
      }
    }
  }

  for (const cat of [categories, subcategories, subsubcategories]) {
  }
  return [categories, subcategories, subsubcategories].map((skillCategory) => {
    let total = 0;
    for (item of skillCategory) {
      total += item.height;
    }
    for (item of skillCategory) {
      item.height = (300 * item.height) / total - 1;
    }
    return skillCategory;
  });
}

module.exports = { findCategoryMetadata };
