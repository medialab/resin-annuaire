const path = require("path");
const fs = require("fs-extra");
const yaml = require("js-yaml");
const csv = require("csvtojson");
const kotatsu = require("kotatsu");
const fetch = require("node-fetch");
const nunjucks = require("nunjucks");
const { sortBy } = require("lodash");
const { promisify } = require("util");

const { formatMembers } = require("../src/format.js");
const { palette } = require("./donutUtils.js");
const { findCategoryMetadata } = require("./searchTableUtils.js");
const { loadImages, createDonut } = require("./buildImages.js");

module.exports = function build() {
  main();
};

const buildJavascript = promisify(kotatsu.build.bind(null, "front"));

// Define paths
const baseUrl = path.join(__dirname, "..", "build");
const siteUrl = path.join(__dirname, "..", "site");
const imageFolder = path.join("assets", "images");
const baseImageFolder = path.join(baseUrl, imageFolder);

const formUrl =
  "https://docs.google.com/spreadsheets/d/1Wner4VHEAGfxmqJ5uLT-n5PJoZKYLUzLs9-_J1PMfq0/export?exportFormat=csv";
const treeUrl = path.join(siteUrl, "data", "tree.yaml");

// Configure nunjucks
const env = nunjucks.configure(path.join(siteUrl, "templates"));
const mainPageTemplate = env.getTemplate("mainPage.html");
const memberPageTemplate = env.getTemplate("memberPage.html");
const legalTemplate = env.getTemplate("legal.html");
const subscribeTemplate = env.getTemplate("subscribe.html");

async function main() {
  fs.removeSync(baseUrl);
  await fs.ensureDir(baseImageFolder);

  const response = await fetch(formUrl);
  const body = await response.text();
  const members = await csv().fromString(body);
  let cleanMembers = formatMembers(members);

  const tree = await yaml.load(fs.readFileSync(treeUrl, "utf-8"));

  await buildJavascript({
    entry: path.join(siteUrl, "js", "search.js"),
    output: path.join(baseUrl, "js", "bundle.js"),
    quiet: true,
    sourceMaps: false,
    config: {
      module: {
        rules: [
          {
            test: /\.html$/,
            include: [path.join(siteUrl, "templates")],
            use: [
              {
                loader: "simple-nunjucks-loader",
                options: {},
              },
            ],
          },
        ],
      },
    },
    // production: true,
  });

  fs.outputFileSync(
    path.join(baseUrl, "mentions-legales.html"),
    legalTemplate.render()
  );

  fs.outputFileSync(
    path.join(baseUrl, "s-inscrire.html"),
    subscribeTemplate.render()
  );

  fs.copySync(
    path.join(siteUrl, "css", "styles.css"),
    path.join(baseUrl, "css", "styles.css")
  );

  fs.copySync(
    path.join(siteUrl, "css", "normalize.css"),
    path.join(baseUrl, "css", "normalize.css")
  );

  const membersWithAvatar = await Promise.all(
    cleanMembers.map(async (member) => {
      let imageFileName = await loadImages(member, baseImageFolder);
      let donutFileName = await createDonut(
        imageFileName,
        member,
        baseImageFolder
      );
      if (imageFileName) {
        return {
          ...member,
          donutFilePath: path.join(imageFolder, donutFileName),
          imageFilePath: path.join(imageFolder, imageFileName),
        };
      }
      return {
        ...member,
        donutFilePath: path.join(imageFolder, donutFileName),
        imageFilePath: "",
      };
    })
  );

  for (const member of membersWithAvatar) {
    fs.outputFileSync(
      path.join(baseUrl, member.slug + ".html"),
      memberPageTemplate.render({ member })
    );
  }

  const [categories, subcategories, subsubcategories] = findCategoryMetadata(
    tree,
    membersWithAvatar,
    palette
  );

  fs.outputFileSync(
    path.join(baseUrl, "index.html"),
    mainPageTemplate.render({
      items: sortBy(membersWithAvatar, ["rank"]),
      categories: categories,
      subcategories: subcategories,
      subsubcategories: subsubcategories,
    })
  );

  fs.outputJSONSync(
    path.join(baseUrl, "assets", "members.json"),
    membersWithAvatar,
    {
      spaces: 2,
    }
  );
}
