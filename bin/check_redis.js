require('dotenv').config();
const redis = require("redis");
const { ArgumentParser } = require('argparse');

const parser = new ArgumentParser({ description: 'Client for redis' });
parser.add_argument('-c', '--city', { help: 'Name of the city to check data', required: true });

let args = parser.parse_args();

const URL = process.env.REDISURL || "redis://127.0.0.1";


const client = redis.createClient({ url: URL });

client.on("error", function (error) {
    console.error("REDIS ERROR", error);
});

/**
 * Example of use of redis in async mode
 */
async function example_async(city) {
    await client.connect();

    let value = await client.get(city);
    console.log("Value", value);
    await client.quit();
}

example_async(args.city);

