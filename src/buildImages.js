const mime = require("mime");
const path = require("path");
const fs = require("fs-extra");
const fetch = require("node-fetch");
const { palette, arc } = require("./donutUtils");

const validImageTypes = ["image/jpeg", "image/png"];

async function createImageFile(httpResponse, filePath) {
  return new Promise((resolve, reject) => {
    let stream = fs.createWriteStream(filePath);
    httpResponse.body.pipe(stream);
    stream.on("finish", resolve);
    stream.on("error", function (error) {
      console.log(error);
      reject();
    });
  });
}

function createArcD(size, start, end) {
  const newArcD = arc({
    x: size / 2,
    y: size / 2,
    R: size / 2,
    r: size / 2 - 50,
    start: start,
    end: end,
  });
  return newArcD;
}

exports.createDonut = async function (imageFileName, member, baseImageFolder) {
  const size = 500;
  const angle = 360 / member.firstSkillsSet.size;

  let donut = [...member.firstSkillsSet].reduce(
    (accumulator, currentValue, currentIndex) => {
      const arcD = createArcD(
        size,
        angle * currentIndex,
        angle * (currentIndex + 1)
      );
      return `${accumulator}<path d="${arcD}" fill="${palette[currentValue]}" fill-rule="evenodd"/>`;
    },
    ""
  );

  let svg = `<?xml version="1.0" standalone="yes"?>
  <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
    "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
  <svg xmlns="http://www.w3.org/2000/svg"
       version="1.1" width="${size}" height="${size}">
       ${donut}
  </svg>`;

  const donutFileName = member.slug + ".svg";
  const donutPath = path.join(baseImageFolder, donutFileName);

  await fs.writeFile(donutPath, svg, "utf-8");

  return donutFileName;
};

exports.loadImages = async function (member, imageFolder) {
  try {
    if (member.avatar) {
      let response = await fetch(member.avatar);
      const contentType = response.headers.get("content-type");
      if (validImageTypes.includes(contentType)) {
        const imageFileName =
          member.slug + "." + mime.getExtension(contentType);
        const imagePath = path.join(imageFolder, imageFileName);
        await createImageFile(response, imagePath);
        return imageFileName;
      }
      return "";
    }
    return "";
  } catch (error) {
    console.log(
      "There was a problem while fetching",
      member.slug + "'s",
      "image at ",
      member.avatar,
      ": " + error
    );
    return "";
  }
};
