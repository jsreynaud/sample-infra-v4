const express = require('express');

const redis = require("redis");

const app = express();
const host = 'localhost'; // Use 0.0.0.0 to listen on all interfaces
const port = 8001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Extract temperature from redis and send back to client
 * 
 * @param {*} city name (from url)
 * @param {*} res object to reply to client
 */
async function getTemp(city, res) {
    res.setHeader('Content-Type', 'application/json');
    const REDISURL = process.env.REDISURL || "redis://127.0.0.1";
    console.log("Query city temperature", city)
    const client = redis.createClient({ url: REDISURL });

    client.on("error", function (error) {
        console.error("ERROR", error);
    });
    await client.connect();

    let reply = await client.get(city);


    if (reply != null) {
        console.log("Reply:", reply);
        res.status(200);
        res.end(JSON.stringify({ "temperature": reply })); // send back temperature
    } else {
        f404(city, res);
    }

}
// Handle 404
function f404(data, res) {
    res.setHeader('Content-Type', 'application/json');
    res.status(404);
    if (data) {
        console.log("Unknown city", data);
        res.end(JSON.stringify({ "error": -1, "message": "Unknown city " + data }));

    } else {
        console.log("Unknown page");
        res.end(JSON.stringify({ "error": -1, "message": "404" }));
    }
}


function run() {

    // route
    app.get('/temp/:city', (req, res) => {
        // req.params.city is the city name
        getTemp(req.params.city, res);
    });

    // Handle all other route to 404
    app.get('/*', (req, res) => {
        console.log("GET 404", req.originalUrl);
        f404(null, res);
    });
    app.post('/*', (req, res) => {
        console.log("POST 404", req.originalUrl);
        f404(null, res);
    });


    app.listen(port, host, () => {

        console.log(`Server is running at http://${host}:${port}`);
    });

}
exports.run = run;
