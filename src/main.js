const express = require('express')
const app = express()
const port = 3000

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

    app.get('/login', (req, res) => {
        res.send('You want to login ?')
    })

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


    app.listen(port, () => {
        console.log(`Server listening on port ${port}`)
    })
}

// Export this function outside
exports.run = run;
