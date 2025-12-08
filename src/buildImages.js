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

const backendHost = process.env.BACKEND_HOST || "localhost";
const internalApiUrl = process.env.INTERNAL_API_URL || "http://localhost:8000";

exports.loadImages = async function (member, imageFolder) {
  try {
    if (member.avatar) {
      let imageUrl = member.avatar;
      if (imageUrl.includes(backendHost))
        imageUrl = imageUrl.replace(
          /^https?:\/\/[^\/]*\//,
          internalApiUrl + "/"
        );
      let response = await fetch(imageUrl);
      const contentType = response.headers.get("content-type");
      if (validImageTypes.includes(contentType)) {
        const imageFileName =
          member.slug + "." + mime.getExtension(contentType);
        const imagePath = path.join(imageFolder, imageFileName);
        await createImageFile(response, imagePath);
        return imageFileName;
      }
      console.log(
        "There was a problem while building",
        member.slug + "'s",
        "image from ",
        imageUrl
      );
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
