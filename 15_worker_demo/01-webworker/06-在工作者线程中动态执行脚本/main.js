// const worker = new Worker("./worker111.js");

// importing script
// scriptA execute
// scriptB execute
// importing end
const worker = new Worker("./worker.js", { name: "foo" });

// importing scripts in foo with bar
//scriptA executes in foo with bar
//scriptB executes in foo with bar
//scripts imported
