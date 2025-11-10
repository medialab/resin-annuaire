// SkillsTree toggle functionality
document.addEventListener("DOMContentLoaded", function() {
  const skillsTree = document.querySelector(".skills-tree");

  if (!skillsTree) return;

  skillsTree.addEventListener("click", function(event) {
    const item = event.target.closest(".item");
    if (!item) return;

    // Find the direct child list (level-2 or level-3)
    const parentLi = item.closest("li");
    const childList = parentLi.querySelector(":scope > ul");

    if (childList) {
      // Toggle between is-open and is-collapsed
      if (childList.classList.contains("is-collapsed")) {
        childList.classList.remove("is-collapsed");
        childList.classList.add("is-open");
      } else {
        childList.classList.remove("is-open");
        childList.classList.add("is-collapsed");
      }
    }
  });
});
