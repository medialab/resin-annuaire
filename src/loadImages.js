const mime = require("mime");
const path = require("path");
const fs = require("fs-extra");
const fetch = require("node-fetch");

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

exports.loadImages = async function (member, imageFolder) {
  try {
    if (member.avatar) {
      let response = await fetch(member.avatar);
      const contentType = response.headers.get("content-type");
      if (validImageTypes.includes(contentType)) {
        const imageFile = member.slug + "." + mime.getExtension(contentType);
        const imagePath = path.join(imageFolder, imageFile);
        await createImageFile(response, imagePath);
        return imageFile;
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
