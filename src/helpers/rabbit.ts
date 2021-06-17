import {getRepository} from "typeorm";
import {Orders} from "../entity/Orders";

const amqp = require('amqplib/callback_api');
const helper = require('../helpers/index');

let amqpConn = null;
let paymentsRepo;
let pubChannel = null;
let offlinePubQueue = [];

async function start(paymentsRepository) {
    paymentsRepo = paymentsRepository;
    amqp.connect("amqps://jjchnylp:rJJA1zTFjllVNbhhEnETLXwXBSg-D8Ak@clam.rmq.cloudamqp.com/jjchnylp" +"?heartbeat=60",
        function(err, conn) {
        if (err) {
            console.error("[AMQP]", err.message);
            return setTimeout(start, 1000);
        }

        conn.on("error", function(err) {
            if (err.message !== "Connection closing") {
                console.error("[AMQP] conn error", err.message);
            }
        });

        conn.on("close", function() {
            console.error("[AMQP] reconnecting");
            return setTimeout(start, 1000);
        });

        console.log("[AMQP] Connected");
        amqpConn = conn;
        whenConnected();
    });
}

function whenConnected() {
    startPublisher();
    startWorker();
}

function startPublisher() {
    amqpConn.createConfirmChannel(function(err, ch) {
        if (closeOnErr(err)) return;
        ch.on("error", function(err) {
            console.error("[AMQP] channel error", err.message);
        });
        ch.on("close", function() {
            console.log("[AMQP] channel closed");
        });

        pubChannel = ch;
        while (true) {
            var m = offlinePubQueue.shift();
            if (!m) break;
            publish(m[0], m[1], m[2]);
        }
    });
}

function publish(exchange, routingKey, content) {
    try {
        pubChannel.publish(exchange, routingKey, content, { persistent: true },
            function(err, ok) {
                if (err) {
                    console.error("[AMQP] publish", err);
                    offlinePubQueue.push([exchange, routingKey, content]);
                    pubChannel.connection.close();
                }
            });
    } catch (e) {
        console.error("[AMQP] publish", e.message);
        offlinePubQueue.push([exchange, routingKey, content]);
    }
}

function startWorker() {
    amqpConn.createChannel(function(err, ch) {
        if (closeOnErr(err)) return;
        ch.on("error", function(err) {
            console.error("[AMQP] channel error", err.message);
        });

        ch.on("close", function() {
            console.log("[AMQP] channel closed");
        });

        ch.prefetch(10);
        ch.assertQueue("payments", { durable: true }, function(err, _ok) {
            if (closeOnErr(err)) return;
            ch.consume("payments", processMsg, { noAck: false });
            console.log("[AMQP] Worker is started");
        });

        function processMsg(msg) {
            work(msg, function(ok) {
                try {
                    if (ok)
                        ch.ack(msg);
                    else {
                        ch.reject(msg);
                        return false
                    }
                } catch (e) {
                    closeOnErr(e);
                }
            });
        }
    });
}

async function work(msg, cb) {
    let message = JSON.parse(msg.content.toString());

    console.log("Processing order:", message.orderNo);
    console.log("Payment processing of R", message.amount);

    const orderRepo = getRepository(Orders);
    const order = await orderRepo.findOne({
        relations: ["order_payments"],
        where: {
            order_no: message.orderNo
        }
    });

    if (helper.orderPaid(order)) {
        console.log("Order is paid in full");
        cb(false);
    } else {
        const payment = paymentsRepo.create({
            status: "1",
            status_desc: message.desc,
            amount: message.amount,
            order: order
        });

        await paymentsRepo.save(payment).catch((err) => {
            console.log("Error: ", err);
        });

        console.log("New payment saved", payment);
        cb(true);
    }
}

function closeOnErr(err) {
    if (!err) return false;
    console.error("[AMQP] error", err);
    amqpConn.close();
    return true;
}

module.exports = { start, publish };