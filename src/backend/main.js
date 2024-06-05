const express = require('express')
const jwt = require('jsonwebtoken');
const app = express();
const amqp = require('amqplib/callback_api');

var validate = require('jsonschema').validate;
// Import our schemas
const schemas = require("../schemas");
const authdb = require("../db/authdb");

const port = 3000
const ACCESS_TOKEN_SECRET = "123456789";
const ACCESS_TOKEN_LIFE = 3600;
const queue = 'from_backend';

// Rabbitmq channel to communicate with rabbitmq
var from_backend_channel;

// Adding a middleware to handle json data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Send a message to rabbitmq
 * 
 * @param {*} data to send to queu
 * @param {*} decoded_jwt token data (normally include user login) 
 */
function push_to_queue(data, decoded_jwt) {
    let d = data;
    d.jwt = decoded_jwt;
    from_backend_channel.sendToQueue(queue, Buffer.from(JSON.stringify(d)));
    console.log(" [x] Sent %s", d);
}

/**
 * Check password validity
 * @param {*} login to check
 * @param {*} password to check
 * @returns {boolean} true if password is valid
 */
function check_password(login, password) {
    // Check password against authdb
    let fnd = authdb.authdb.find(element => {
        return element.login == login && element.password == password;
    });

    if (fnd) {
        return true;
    } else {
        return false;
    }
}

/**
 * login action for /login route
 * 
 * @param {*} req from express
 * @param {*} res from express
 */
function login(req, res) {
    let validation = validate(req.body, schemas.login_schema);
    // Check result is valid
    if (validation.valid) {
        // Detect if login and password are correct
        if (req.body.login && req.body.password &&
            check_password(req.body.login, req.body.password)) {
            // Create a token with use data (only login). The token will be valid for ACCESS_TOKEN_LIFE seconds
            let token = jwt.sign({ login: req.body.login }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_LIFE, algorithm: 'HS512' });
            res.send({ code: 0, message: "Welcome back !", token: token })
        } else {
            res.status(401).send({ code: -1, message: "Invalid login or password" })
        }
    } else {
        res.status(400).send({ code: -1, message: "Invalid data schema" })
    }

}

/**
 * pushdata action for /pushdata route
 * 
 * @param {*} req from express
 * @param {*} res from express
 * @returns 
 */
function pushdata(req, res) {
    let validation = validate(req.body, schemas.postdata_schema);
    if (validation.valid) {
        if (req.body.token && req.body.data) {
            try {
                let result = jwt.verify(req.body.token, ACCESS_TOKEN_SECRET)
                console.log("Data:", req.body);
                push_to_queue(req.body, result);
                res.status(201).send({ code: 0, message: "Data received for user " + result.login })
            } catch (err) {
                res.status(401).send({ code: -1, message: "Invalid token" })
                return
            }
        } else {
            res.status(401).send({ code: -1, message: "Invalid data" })
        }
    } else {
        res.status(400).send({ code: -1, message: "Invalid data schema" })
    }
}

var action_iter = 0;
const action_array = [{ type: "print", data: "Bonjour" },
{ type: "print", data: "tout" },
{ type: "print", data: "le" },
{ type: "print", data: "monde" },
{ type: "end" },
];


function pull(req, res) {
    let validation = validate(req.body, schemas.pull_schema);
    if (validation.valid) {
        // Check JWT validity
        jwt.verify(req.body.token, ACCESS_TOKEN_SECRET, function (err, decoded) {
            if (err) { // There is an error: invalid jwt ...
                res.status(401).send({ "error": -1, "message": "JWT error" });
            } else {
                res.status(201).send({
                    code: 0, message: "ok", data: action_array[action_iter++ % action_array.length]
                });
            }
        });
    } else {
        res.status(400).send({ code: -1, message: "Invalid data schema" })
    }
}


/**
 * Run express application (routes and listen)
 */
function run_express() {
    console.log("Starting express");
    app.get('/', (req, res) => {
        res.send('Hello World!')
    })

    app.post('/login', (req, res) => {
        login(req, res);
    })

    app.post('/pushdata', (req, res) => {
        pushdata(req, res);
    });

    app.post('/pull', (req, res) => {
        pull(req, res);
    });


    app.get("/*", (req, res) => {
        res.status(404).send({ "code": -1, "message": "Invalid URL" });
    });

    app.listen(port, () => {
        console.log(`Server listening on port ${port}`)
    })
}


/**
 * Define the main function for main module
 */
function run() {
    const IP = process.env.IP || "127.0.0.1";
    const username = process.env.user || 'guest';
    const password = process.env.password || 'guest';
    const opt = { credentials: require('amqplib').credentials.plain(username, password) };

    amqp.connect('amqp://' + IP, opt, function (error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function (error1, channel) {
            if (error1) {
                throw error1;
            }
            channel.assertQueue(queue, {
                durable: true
            });
            from_backend_channel = channel;
            // Really run express
            run_express();
        });
    });
}

// Export this function outside
exports.run = run;
