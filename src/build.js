const path = require("path");
const fs = require("fs-extra");
const csv = require("csvtojson");
const fetch = require("node-fetch");
const nunjucks = require("nunjucks");
const pandemonium = require("pandemonium");

module.exports = function build() {
  main();
};

const baseUrl = path.join(__dirname, "..", "build");
const siteUrl = path.join(__dirname, "..", "site");
const env = nunjucks.configure(path.join(siteUrl, "templates"));
const template = env.getTemplate("template.html");
const formUrl =
  "https://docs.google.com/spreadsheets/d/1Wner4VHEAGfxmqJ5uLT-n5PJoZKYLUzLs9-_J1PMfq0/export?exportFormat=csv";

async function main() {
  const response = await fetch(formUrl);
  const body = await response.text();
  const items = await csv().fromString(body);
  const output = template.render({
    items: pandemonium.shuffle(items),
  });
  fs.removeSync(baseUrl);
  fs.outputFileSync(path.join(baseUrl, "index.html"), output);
}
