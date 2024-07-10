const path = require("path");
const fs = require("fs-extra");
const yaml = require("js-yaml");
const csv = require("csvtojson");
const kotatsu = require("kotatsu");
const fetch = require("node-fetch");
const nunjucks = require("nunjucks");
const { sortBy } = require("lodash");
const { promisify } = require("util");

const { formatMembers, formatSkills } = require("../src/format.js");
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

const apiUrl = process.env.API_URL || "http://localhost:8000";

// Configure nunjucks
const env = nunjucks.configure(path.join(siteUrl, "templates"));
const searchPageTemplate = env.getTemplate("searchPage.html");
const memberPageTemplate = env.getTemplate("memberPage.html");
const legalPageTemplate = env.getTemplate("legalPage.html");
const subscribePageTemplate = env.getTemplate("subscribePage.html");
const notFoundPageTemplate = env.getTemplate("notFoundPage.html");

async function main() {
  fs.removeSync(baseUrl);
  await fs.ensureDir(baseImageFolder);

  const fieldsTreeResponse = await fetch(path.join(apiUrl, "api", "fields"));
  const skillsTreeResponse = await fetch(path.join(apiUrl, "api", "skills"));
  const fieldsTree = await fieldsTreeResponse.json();
  const skillsTree = await skillsTreeResponse.json();
  const idToLabel = formatSkills(fieldsTree, skillsTree);

  const members = await fetch(path.join(apiUrl, "api", "members"));
  const membersJson = await members.json();
  let cleanMembers = formatMembers(membersJson, idToLabel);

  await buildJavascript({
    entry: {
      search: path.join(siteUrl, "js", "search.js"),
      form: path.join(siteUrl, "js", "formulaire.js"),
      edit: path.join(siteUrl, "js", "editProfile.js"),
    },
    output: path.join(baseUrl, "js", "[name].js"),
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
    legalPageTemplate.render(),
  );

  fs.outputFileSync(
    path.join(baseUrl, "s-inscrire.html"),
    subscribePageTemplate.render({ apiUrl }),
  );

  fs.outputFileSync(
    path.join(baseUrl, "404.html"),
    notFoundPageTemplate.render(),
  );

  fs.copySync(
    path.join(siteUrl, "css", "styles.css"),
    path.join(baseUrl, "css", "styles.css"),
  );

  fs.copySync(
    path.join(siteUrl, "css", "normalize.css"),
    path.join(baseUrl, "css", "normalize.css"),
  );

  const membersWithAvatar = await Promise.all(
    cleanMembers.map(async (member) => {
      let imageFileName = await loadImages(member, baseImageFolder);
      let donutFileName = await createDonut(
        imageFileName,
        member,
        baseImageFolder,
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
    }),
  );

  for (const member of membersWithAvatar) {
    fs.outputFileSync(
      path.join(baseUrl, member.slug + ".html"),
      memberPageTemplate.render({ member: member, apiUrl: apiUrl }),
    );
  }

  const [categories, subcategories, subsubcategories] = findCategoryMetadata(
    idToLabel,
    membersWithAvatar,
    palette,
  );

  fs.outputFileSync(
    path.join(baseUrl, "index.html"),
    searchPageTemplate.render({
      items: sortBy(membersWithAvatar, ["rank"]),
      categories: categories,
      subcategories: subcategories,
      subsubcategories: subsubcategories,
    }),
  );

  fs.outputJSONSync(
    path.join(baseUrl, "assets", "members.json"),
    membersWithAvatar,
    {
      spaces: 2,
    },
  );
}
