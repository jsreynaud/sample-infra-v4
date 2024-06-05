const axios = require('axios');
const { ArgumentParser } = require('argparse');

const parser = new ArgumentParser({ description: 'Client for the backend' });
parser.add_argument('-l', '--login', { help: 'Login to use', required: true });
parser.add_argument('-p', '--password', { help: 'Password to use', required: true });
parser.add_argument('-t', '--target', { help: 'Target to use', type: 'int', choices: [0, 1, 2], required: true });
parser.add_argument('-c', '--city', { help: 'City to use', required: true });

let args = parser.parse_args();




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

// Setting default value
let login = args.login;
let password = args.password;
let target = args.target;

/* Doing POST ... Imbricate them*/
POST({ login: login, password: password }, "/login", d => {
    console.log(d);
    let token = d.token;
    POST({ token: token, data: { temperature: (Date.now() / 1000) % 31, position: args.city }, target: target }, "/pushdata", d => {
        console.log(d);
    });
});
