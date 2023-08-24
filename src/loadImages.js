const mime = require("mime");
const path = require("path");
const fs = require("fs-extra");
const fetch = require("node-fetch");

exports.loadImages = async function (member, imageFolder, validImageTypes) {
  member.imageFile = "";
  if (member.avatar) {
    await fetch(member.avatar)
      .then((response) => {
        const contentType = response.headers.get("content-type");
        if (validImageTypes.includes(contentType)) {
          const imageFile = member.slug + "." + mime.getExtension(contentType);
          const imagePath = path.join(imageFolder, imageFile);
          response.body.pipe(fs.createWriteStream(imagePath));
        }
      })
      .catch((error) =>
        console.log(
          "There was a problem while fetching",
          member.slug + "'s",
          "image at ",
          member.avatar,
          ": " + error
        )
      );
  }
};
