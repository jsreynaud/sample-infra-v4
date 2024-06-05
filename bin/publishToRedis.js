require('dotenv').config();

const main = require("../src/publish/main");

console.log("Starting publishing to Redis");

main.run();
