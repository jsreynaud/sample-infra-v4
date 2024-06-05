const axios = require('axios');

function POST(jdata, url, f) {
    axios.post('http://localhost:3000' + url, jdata)
        .then((res) => {
            f(res.data);
        }).catch((err) => {
            if (err && "response" in err && err.response && "data" in err.response) {
                console.error(err.response.data);
            } else {
                console.error("Other Error", err);
            }
        });

}

function apply_command(action) {
    console.log("Action", action);
    if (action.type == "print") {
        console.log(action.data);
    } else if (action.type == "end") {
        console.log("End");
        process.exit(0);
    }
}

// Setting default value
let login = "test";
let password = "pass";
// If some parameters are there, use them...
if (process.argv.length > 3) {
    login = process.argv[2];
    password = process.argv[3];
}

/* Doing POST ... Imbricate them*/
POST({ login: login, password: password }, "/login", d => {
    console.log(d);
    let token = d.token;
    POST({ token: token, data: 'ok' }, "/pushdata", d => {
        console.log(d);
        setInterval(() => {
            POST({ token: token }, "/pull", d => {
                console.log(d);
                apply_command(d.data);
            });
        }, 3000);
    });
});
