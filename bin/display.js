/**
 * Entry point for the display service.
 */
require('dotenv').config();

const main = require("../src/display/main");

console.log("Starting Display");

main.run();
