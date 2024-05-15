function loadJSON(callback) {
  var request = new XMLHttpRequest();
  request.overrideMimeType("application/json");
  request.open("GET", "assets/members.json", true);
  request.onreadystatechange = function () {
    if (request.readyState == 4 && request.status == "200") {
      callback(JSON.parse(request.responseText));
    }
  };
  request.send(null);
}

module.exports = loadJSON;
