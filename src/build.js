const path = require("path");
const slug = require("slug");
const fs = require("fs-extra");
const csv = require("csvtojson");
const { sortBy } = require("lodash");
const fetch = require("node-fetch");
const nunjucks = require("nunjucks");
const pandemonium = require("pandemonium");

const remap = require("./remap.js");

module.exports = function build() {
  main();
};

const baseUrl = path.join(__dirname, "..", "build");
const siteUrl = path.join(__dirname, "..", "site");

const env = nunjucks.configure(path.join(siteUrl, "templates"));
const main_page_template = env.getTemplate("mainPage.html");
const member_page_template = env.getTemplate("memberPage.html");

const formUrl =
  "https://docs.google.com/spreadsheets/d/1Wner4VHEAGfxmqJ5uLT-n5PJoZKYLUzLs9-_J1PMfq0/export?exportFormat=csv";

function formatMembers(formItems) {
  const ranks = pandemonium.shuffle([...Array(formItems.length).keys()]);
  let uniqueSlugs = {};
  let cleanItems = [];

  for (i = 0; i < formItems.length; i++) {
    let cleanItem = {};
    for (const key in formItems[i]) {
      cleanItem[remap[key]] = formItems[i][key];
    }
    cleanItem.rank = ranks[i];
    const nameSlug = slug(cleanItem.firstName + " " + cleanItem.lastName);
    if (!(nameSlug in uniqueSlugs)) {
      uniqueSlugs[nameSlug] = [];
    }
    uniqueSlugs[nameSlug].push(cleanItem);
  }

  for (const nameSlug in uniqueSlugs) {
    if (uniqueSlugs[nameSlug].length > 0) {
      uniqueSlugs[nameSlug] = sortBy(uniqueSlugs[nameSlug], ["timestamp"]);
    }
    for (i = 0; i < uniqueSlugs[nameSlug].length; i++) {
      if (i == 0) {
        uniqueSlugs[nameSlug][i].slug = nameSlug;
      } else {
        uniqueSlugs[nameSlug][i].slug = nameSlug + "-" + i;
      }
      cleanItems.push(uniqueSlugs[nameSlug][i]);
    }
  }

  return cleanItems;
}

async function main() {
  fs.removeSync(baseUrl);

  const response = await fetch(formUrl);
  const body = await response.text();
  const members = await csv().fromString(body);
  const cleanMembers = formatMembers(members);

  fs.outputFileSync(
    path.join(baseUrl, "index.html"),
    main_page_template.render({
      items: sortBy(cleanMembers, ["rank"]),
    })
  );

  for (member of cleanMembers) {
    fs.outputFileSync(
      path.join(baseUrl, member.slug + ".html"),
      member_page_template.render({
        member: member,
      })
    );
  }

  fs.outputJSONSync(
    path.join(baseUrl, "assets", "members.json"),
    cleanMembers,
    {
      spaces: 2,
    }
  );
}
