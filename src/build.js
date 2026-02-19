const path = require("path");
const fs = require("fs-extra");
const yaml = require("js-yaml");
const csv = require("csvtojson");
const kotatsu = require("kotatsu");
const fetch = require("@adobe/node-fetch-retry");
const nunjucks = require("nunjucks");
const markdown = require("nunjucks-markdown");
const marked = require("marked");
const { sortBy } = require("lodash");
const { promisify } = require("util");

const {
  formatMembers,
  formatSkills,
  formatLanguages,
} = require("../src/format.js");
const { findCategoryMetadata } = require("./searchTableUtils.js");
const http = require("node:http");
const https = require("node:https");

module.exports = function build() {
  main();
};

const buildJavascript = promisify(kotatsu.build.bind(null, "front"));

// Define paths
const baseUrl = path.join(__dirname, "..", "build");
const siteUrl = path.join(__dirname, "..", "site");
const imageFolder = path.join("assets", "images");
const baseImageFolder = path.join(baseUrl, imageFolder);

const apiUrl = process.env.API_URL || "https://www.projet-resin.fr";
const internalApiUrl =
  process.env.INTERNAL_API_URL || "https://www.projet-resin.fr";

// Configure nunjucks
const env = nunjucks.configure(path.join(siteUrl, "templates"));
markdown.register(env, marked.parse);
const searchPageTemplate = env.getTemplate("searchPage.html");
const memberPageTemplate = env.getTemplate("memberPage.html");
const legalPageTemplate = env.getTemplate("legalPage.html");
const subscribePageTemplate = env.getTemplate("subscribePage.html");
const projectPageTemplate = env.getTemplate("projectPage.html");
const aboutPageTemplate = env.getTemplate("aboutPage.html");
const newsletterPageTemplate = env.getTemplate("newsletter.html");
const ressourcesPageTemplate = env.getTemplate("ressourcesPage.html");
const notFoundPageTemplate = env.getTemplate("notFoundPage.html");

const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });
const agent = (_parsedURL) =>
  _parsedURL.protocol === "http:" ? httpAgent : httpsAgent;

async function main() {
  fs.removeSync(baseUrl);
  await fs.ensureDir(baseImageFolder);

  const fieldsTreeResponse = await fetch(internalApiUrl + "/api/fields/", {
    agent,
  });
  const fieldsTree = await fieldsTreeResponse.json();

  const skillsTreeResponse = await fetch(internalApiUrl + "/api/skills/", {
    agent,
  });
  const skillsTree = await skillsTreeResponse.json();
  const idToLabel = formatSkills(fieldsTree, skillsTree);

  const members = await fetch(internalApiUrl + "/api/members/", { agent });
  const membersJson = await members.json();

  const languages = await fetch(internalApiUrl + "/api/languages/", { agent });
  const languagesJson = await languages.json();
  const idToLanguage = formatLanguages(languagesJson);

  let cleanMembers = formatMembers(
    membersJson,
    idToLanguage,
    idToLabel,
    apiUrl,
  );

  await buildJavascript({
    entry: {
      search: path.join(siteUrl, "js", "search.js"),
      form: path.join(siteUrl, "js", "formulaire.js"),
      edit: path.join(siteUrl, "js", "profile.js"),
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
    path.join(baseUrl, "projet.html"),
    projectPageTemplate.render(),
  );

  fs.outputFileSync(
    path.join(baseUrl, "a-propos.html"),
    aboutPageTemplate.render(),
  );

  fs.outputFileSync(
    path.join(baseUrl, "liste-de-diffusion.html"),
    newsletterPageTemplate.render(),
  );

  fs.outputFileSync(
    path.join(baseUrl, "ressources.html"),
    ressourcesPageTemplate.render(),
  );

  fs.outputFileSync(
    path.join(baseUrl, "404.html"),
    notFoundPageTemplate.render(),
  );

  fs.copySync(
    path.join(siteUrl, "css", "style.css"),
    path.join(baseUrl, "css", "style.css"),
  );

  fs.copySync(path.join(siteUrl, "fonts"), path.join(baseUrl, "fonts"));

  fs.copySync(path.join(siteUrl, "js", "static"), path.join(baseUrl, "js"));

  fs.copySync(
    path.join(siteUrl, "data", "images"),
    path.join(baseUrl, "data", "images"),
  );

  for (const member of cleanMembers) {
    fs.outputFileSync(
      path.join(baseUrl, member.slug + ".html"),
      memberPageTemplate.render({ member: member, apiUrl: apiUrl }),
    );
  }

  const [categories, subcategories, subsubcategories] = findCategoryMetadata(
    idToLabel,
    cleanMembers,
  );

  fs.outputFileSync(
    path.join(baseUrl, "index.html"),
    searchPageTemplate.render({
      items: sortBy(cleanMembers, ["rank"]),
      categories: categories,
      subcategories: subcategories,
      subsubcategories: subsubcategories,
      total_members: cleanMembers.length,
    }),
  );

  fs.outputJSONSync(
    path.join(baseUrl, "assets", "members.json"),
    cleanMembers,
    {
      spaces: 2,
    },
  );
}
