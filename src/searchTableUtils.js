function findCategoryMetadata(idToLabel, members, palette) {
  let metadata = [[], [], []];

  let memberCounts = {};

  for (const member of members) {
    let skillSet = new Set();
    for (const skillId of member.allSkills) {
      const path = idToLabel.get(skillId).path;
      path.forEach((id) => skillSet.add(id));
    }
    skillSet.forEach((id) => {
      if (!(id in memberCounts)) {
        memberCounts[id] = 0;
      }
      memberCounts[id] += 1;
    });
  }

  for (const [skillId, obj] of idToLabel.entries()) {
    index = obj.path.length - 1;
    if (memberCounts[skillId]) {
      metadata[index].push({
        label: obj.label,
        path: obj.path,
        height: memberCounts[skillId],
        color: palette[idToLabel.get(obj.path[0]).label],
      });
    }
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
