const fs = require("fs");
const fetch = require("node-fetch");
const csv = require("csvtojson");
const nunjucks = require("nunjucks");

const shuffle = require("./shuffle.js");

module.exports = function build() {
  main();
};

var env = nunjucks.configure(["./", "./site/templates/"]);
var template = env.getTemplate("template.html");
const formUrl =
  "https://docs.google.com/spreadsheets/d/1Wner4VHEAGfxmqJ5uLT-n5PJoZKYLUzLs9-_J1PMfq0/export?exportFormat=csv";

async function main() {
  const response = await fetch(formUrl);
  const body = await response.text();
  var items = await csv().fromString(body);
  var output = template.render({
    items: shuffle(items),
  });
  fs.writeFile("index.html", output, (err) => {
    if (err) {
      console.error(err);
    }
    console.log("Wrote file index.html");
  });
}
