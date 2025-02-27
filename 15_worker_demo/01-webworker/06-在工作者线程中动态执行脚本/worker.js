// console.log("importing script");

// // importScripts("./scriptA");
// // importScripts("./scriptB");

// importScripts("./scriptA.js", "./scriptB.js");

// console.log("importing end");

  const globalToken = "bar";
  console.log(`importing scripts in ${self.name} with ${globalToken}`);
  importScripts("./scriptA.js", "./scriptB.js");
  console.log("scripts imported");
