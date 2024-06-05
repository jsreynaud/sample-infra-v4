require('dotenv').config();
const redis = require("redis");
const { ArgumentParser } = require('argparse');

const parser = new ArgumentParser({ description: 'Client for redis' });
parser.add_argument('-a', '--async', { help: 'Async mode', action: 'store_true' });

let args = parser.parse_args();

const URL = process.env.REDISURL || "redis://127.0.0.1";


const client = redis.createClient({ url: URL });

client.on("error", function (error) {
    console.error("REDIS ERROR", error);
});

/**
 * Example of use of redis in async mode
 */
async function example_async() {
    await client.connect();

    let value = await client.get('key');
    console.log("Previous value", value);

    // Set the value
    await client.set('key', 'value - ' + Date.now());

    value = await client.get('key');
    console.log("New value", value);
    await client.quit();
    console.log("End of async mode");
}

/**
 * Example of use of redis in sync mode.
 */
function example_sync(callback) {
    client.connect().then(() => {
        client.get('key').then((v) => {
            console.log("Previous value", v);
            client.set('key', 'value - ' + Date.now()).then(() => {
                client.get('key').then((v) => {
                    console.log("New value", v);
                    client.quit();
                    callback();
                });
            });
        })
    })
}

if (args.async) {
    example_async();
} else {
    example_sync(() => { console.log("End of sync mode"); });
}

