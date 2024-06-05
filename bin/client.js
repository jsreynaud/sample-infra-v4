const axios = require('axios');

function POST(jdata, url, f) {

    axios.post('http://localhost:3000' + url, jdata)
        .then((res) => {
            f(res.data);
        }).catch((err) => {
            if (err && "response" in err && err.response && "data" in err.response) {
                console.error(err.response.data);
            } else {
                console.error("Other Error");
            }
        });

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
    POST({ token: d.token, data: 'ok' }, "/pushdata", d => {
        console.log(d);
    });
});
