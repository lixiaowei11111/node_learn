const path = require("path");
const express = require("express");
const favicon = require("serve-favicon");
const app = express();

app.get("*", (req, res, next) => {
  console.log(req.url);
  next();
});

const options = {
  setHeaders(res, filePath, stat) {
    res.set({
      "cache-control": "no-cache",
    });
  },
};

app.use(express.static("src", options));

app.use(
  express.static("sw", {
    maxAge: 0,
  })
);
app.listen("8080", () => {
  console.log("server start at localhost:9000");
});
