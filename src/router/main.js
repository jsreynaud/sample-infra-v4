const authdb = require("../db/authdb");
const routingdb = require("../db/routingdb");
var amqp = require('amqplib/callback_api');

// Rabbitmq channel. Used to send messages to rabbitmq
var global_channel;
// Input Rabbitmq queue name
const from_backend_queue = 'from_backend';


/**
 * Check access rights for a user to a queue
 * @param {string} login 
 * @param {string} target_queue 
 * @returns 
 */
function check_permissions(login, target_queue) {
    let fnd = authdb.authdb.find(element => {
        return element.login == login && element.allowed_queues.includes(target_queue);
    });
    if (fnd) {
        return true;
    } else {
        return false;
    }
}

/**
 * Callback function for rabbitmq consume. on_message is called when a message is received
 * 
 * @param {object} msg 
 */
function on_message(msg) {
    // Extract the message
    msg = JSON.parse(msg.content.toString());
    // Check that destination is a valid value
    if (msg.target < routingdb.routingdb.length && msg.target >= 0) {
        // Check permissions
        if (check_permissions(msg.jwt.login, msg.target)) {
            console.log("Send Message to queue", routingdb.routingdb[msg.target], msg.data);
            // If ok: publich message on dedicated queue
            global_channel.sendToQueue(routingdb.routingdb[msg.target], Buffer.from(JSON.stringify(msg.data)));
        } else {
            // Drop the message (an let an error message)
            console.error("Illegal submission from username", msg.jwt.login, "to", msg.target);
        }
    } else {
        console.error("Invalid destination", msg.target, routingdb.routingdb.length);
    }

}

/**
 *  Main function for router. Open a connection to rabbitmq, consume messages 
 * and dispatch them to the right target queue
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
            // Create queue "from_backend"
            channel.assertQueue(from_backend_queue, {
                durable: true
            });
            global_channel = channel;
            // Create all output queues (based on routingdb)
            routingdb.routingdb.forEach(element => {
                channel.assertQueue(element, {
                    durable: true
                });
            });

            // Start consume input queue. Our function on_message is called when a message is received
            channel.consume(from_backend_queue, on_message, {
                noAck: true
            });

        });

    });



}

exports.run = run;
