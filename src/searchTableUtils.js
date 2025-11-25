function findCategoryMetadata(idToLabel, members, palette) {
  let metadata = [[], [], []];

  let memberCounts = {};

  for (const member of members) {
    member.allSkills.forEach((id) => {
      if (!(id in memberCounts)) {
        memberCounts[id] = 0;
      }
      memberCounts[id] += 1;
    });
  }

  // Calculer les IDs enfants pour chaque compétence
  function getChildrenIds(skillId, idToLabel) {
    const children = [skillId]; // Inclut l'ID lui-même

    for (const [id, obj] of Object.entries(idToLabel)) {
      const path = obj.path;
      // Si le path commence par le skillId, c'est un enfant
      if (path.includes(parseInt(skillId)) && !children.includes(parseInt(id))) {
        const skillIdIndex = path.indexOf(parseInt(skillId));
        // Si skillId n'est pas le dernier élément du path, c'est un parent
        if (skillIdIndex < path.length - 1) {
          children.push(parseInt(id));
        }
      }
    }

    return children;
  }

  for (const [skillId, obj] of Object.entries(idToLabel)) {
    index = obj.path.length - 1;
    if (memberCounts[skillId]) {
      const childrenIds = getChildrenIds(skillId, idToLabel);

      metadata[index].push({
        label: obj.label,
        path: obj.path.join("/") + "/",
        skillId: parseInt(skillId),
        childrenIds: childrenIds,
        height: memberCounts[skillId],
        count: memberCounts[skillId],
        color: palette[idToLabel[obj.path[0]].label],
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
