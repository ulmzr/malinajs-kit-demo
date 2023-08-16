const sassPlugin = require("malinajs/plugins/sass.js");
const fs = require("fs");
const path = require("path");
const cwd = process.cwd();
const dev = process.argv.includes("-w");
const env = fs.existsSync(path.join(cwd, "config.js")) ? require(path.join(cwd, "config.js")) : {};
const outdir = env.outdir || "public";

if (dev) fs.writeFileSync(path.join(outdir, "main.css"), "");

module.exports = function (option, filename) {
   option.css = dev;
   option.passClass = false;
   option.immutable = true;
   option.plugins = [sassPlugin()];
   option.autoimport = (name) => `import {${name}} from './';`;
   return option;
};
