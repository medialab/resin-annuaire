const path = require("path");
const fs = require("fs-extra");
const csv = require("csvtojson");
const kotatsu = require("kotatsu");
const fetch = require("node-fetch");
const nunjucks = require("nunjucks");
const { sortBy } = require("lodash");
const { promisify } = require("util");

const { formatMembers } = require("../src/format.js");
const { loadImages } = require("../src/loadImages.js");

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

  for (member of cleanMembers) {
    fs.outputFileSync(
      path.join(baseUrl, member.slug + ".html"),
      memberPageTemplate.render({
        member: member,
      })
    );
  }

  fs.copySync(
    path.join(siteUrl, "css", "styles.css"),
    path.join(baseUrl, "css", "styles.css")
  );

  const membersWithImage = await Promise.all(
    cleanMembers.map(async (member) => {
      let imageFile = await loadImages(member, baseImageFolder);
      if (imageFile) {
        return { ...member, imageFile: path.join(imageFolder, imageFile) };
      }
      return { ...member, imageFile: "" };
    })
  );

  fs.outputFileSync(
    path.join(baseUrl, "index.html"),
    mainPageTemplate.render({
      items: sortBy(membersWithImage, ["rank"]),
    })
  );

  fs.outputJSONSync(
    path.join(baseUrl, "assets", "members.json"),
    membersWithImage,
    {
      spaces: 2,
    }
  );
}
