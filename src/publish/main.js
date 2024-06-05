const routingdb = require("../db/routingdb");
const redis = require("redis");

const { ArgumentParser } = require('argparse');

const REDISURL = process.env.REDISURL || "redis://127.0.0.1";


const client = redis.createClient({ url: REDISURL });


async function run() {
    // Launch Redis connection
    await client.connect();

    // getting queue name from routingdb
    let queue_name = routingdb.routingdb[0];

    console.log("publish to redis")
    var amqp = require('amqplib/callback_api');

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

            channel.assertQueue(queue_name, {
                durable: true
            });
            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue_name);
            channel.consume(queue_name, async function (msg) {
                console.log(" [x] Received %s", msg.content.toString());
                let data = JSON.parse(msg.content.toString())
                let villeMin = data.position.toLowerCase()
                console.log("Set in redis:", villeMin, data.temperature);
                await client.set(villeMin, data.temperature)

            }, {
                noAck: true
            });
        });
    });

}

exports.run = run;
