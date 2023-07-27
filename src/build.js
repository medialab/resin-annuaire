const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const csv = require("csvtojson");
const nunjucks = require("nunjucks");

const shuffle = require("./shuffle.js");

module.exports = function build() {
  main();
};

const env = nunjucks.configure([
  path.join(__dirname, "..", "site", "templates"),
]);
const template = env.getTemplate("template.html");
const formUrl =
  "https://docs.google.com/spreadsheets/d/1Wner4VHEAGfxmqJ5uLT-n5PJoZKYLUzLs9-_J1PMfq0/export?exportFormat=csv";

async function main() {
  const response = await fetch(formUrl);
  const body = await response.text();
  const items = await csv().fromString(body);
  const output = template.render({
    items: shuffle(items),
  });
  fs.writeFileSync("index.html", output);
  console.log("Wrote index.html");
}
