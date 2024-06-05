const express = require('express')
const jwt = require('jsonwebtoken');
const app = express()

const port = 3000
const ACCESS_TOKEN_SECRET = "123456789";
const ACCESS_TOKEN_LIFE = 3600;


// Adding a middleware to handle json data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Define the main function for mail module
 */
function run() {
    app.get('/', (req, res) => {
        res.send('Hello World!')
    })

    app.post('/login', (req, res) => {
        // Detect if login and password are correct
        if (req.body.login && req.body.password &&
            req.body.login === 'test' && req.body.password === 'pass') {
            // Create a token with use data (only login). The token will be valid for ACCESS_TOKEN_LIFE seconds
            let token = jwt.sign({ login: req.body.login }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_LIFE, algorithm: 'HS512' });
            res.send({ code: 0, message: "Welcome back !", token: token })
        } else {
            res.status(401).send({ code: -1, message: "Invalid login or password" })
        }
    })

    app.post('/pushdata', (req, res) => {
        if (req.body.token && req.body.data) {
            try {
                let result = jwt.verify(req.body.token, ACCESS_TOKEN_SECRET)
                console.log("Data:", req.body.data);
                res.status(201).send({ code: 0, message: "Data received for user " + result.login })
            } catch (err) {
                res.status(401).send({ code: -1, message: "Invalid token" })
                return
            }
        } else {
            res.status(401).send({ code: -1, message: "Invalid data" })
        }
    });

    app.get('/data', (req, res) => {
        res.send('You want access data ?')
    })

    app.post('/data', (req, res) => {
        if (req.body.username && req.body.email) {
            const key1 = req.body.username;
            const key2 = req.body.email;
            // Reformat the data for testing...
            res.send({
                'key1': key1,
                'key2': key2
            });
        } else {
            // Fallback
            console.log(req.body);
            res.send("Invalid data");
        }
    });

    app.get("/*", (req, res) => {
        res.status(404).send({ "code": -1, "message": "Invalid URL" });
    });

    app.listen(port, () => {
        console.log(`Server listening on port ${port}`)
    })
}

// Export this function outside
exports.run = run;
