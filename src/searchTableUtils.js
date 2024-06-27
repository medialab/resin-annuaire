function findCategoryMetadata(skillsMap, members, palette) {
  let metadata = [[], [], []];

  let memberCounts = {};

  for (const member of members) {
    for (const skillId of member.allSkills) {
      if (!(skillId in memberCounts)) {
        memberCounts[skillId] = 0;
      }
      memberCounts[skillId] += 1;
    }
  }

  for (const [skillId, values] of skillsMap.entries()) {
    index = values.length - 1;
    metadata[index].push({
      label: values[index],
      path: skillId,
      height: memberCounts[skillId] || 0,
      color: palette[values[0]],
    });
  }

  return metadata.map((skillCategory) => {
    let total = 0;
    for (item of skillCategory) {
      total += item.height;
    }
    for (item of skillCategory) {
      item.height = (350 * item.height) / total - 1;
    }
    return skillCategory;
  });
}

module.exports = { findCategoryMetadata };
