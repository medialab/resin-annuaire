function findCategoryMetadata(tree, members, palette) {
  let categories = [];
  let subcategories = [];
  let subsubcategories = [];

  let memberCounts = {};

  for (const member of members) {
    for (const skill of member.allSkillsArray) {
      if (!(skill in memberCounts)) {
        memberCounts[skill] = 0;
      }
      memberCounts[skill] += 1;
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
      subcategories.push({
        label: key1,
        path: path,
        height: memberCounts[path] || 0,
        color: palette[key0],
      });

      if (leaf) {
        for (const key2 of leaf) {
          const path = key0 + "/" + key1 + "/" + key2;
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
  return [categories, subcategories, subsubcategories];
}

module.exports = { findCategoryMetadata };
