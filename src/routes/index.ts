import * as express from "express";
import {Request, Response} from "express";
import {getRepository} from "typeorm";
import {Orders} from "../entity/Orders";
import {Products} from "../entity/Products";
import {OrderItems} from "../entity/OrderItems";
import {OrderPayments} from "../entity/OrderPayments";

const rabbit = require('../helpers/rabbit');
const helper = require('../helpers/index');

export const register = ( app: express.Application ) => {
    const ordersRepo = getRepository(Orders);
    const productsRepo = getRepository(Products);
    const orderItemsRepo = getRepository(OrderItems);
    const paymentsRepo = getRepository(OrderPayments);

    app.get("/orders", async function(req: Request, res: Response) {
        const orders = await ordersRepo.find({relations: ["order_payments", "order_items"]});

        res.json({
            status: "Success",
            orders,
            length: orders.length
        });
    });

    app.get("/order", async function(req: Request, res: Response) {
        if (req.query.orderNo) {
            const order = await ordersRepo.findOne({
                relations: ["order_payments", "order_items"],
                where: {
                    order_no: req.query.orderNo.toString()
                }
            });

            if (order) {
                res.json({
                    status: "Success",
                    order
                });
            } else {
                res.json({
                    status: "Failure",
                    message: "No order found"
                });
            }
        } else {
            res.json({
                status: "Failure",
                message: "No order number provided"
            });
        }
    });

    app.get("/payments", async function(req: Request, res: Response) {
        if (req.query.id) {
            const payment = await paymentsRepo.findOne({
                where: { id: req.query.id.toString()}
            });

            if (payment) {
                res.json({
                    status: "Success",
                    payment
                });
            } else {
                res.json({
                    status: "Failure",
                    message: "Payment not found"
                })
            }
        } else {
            const payments = await paymentsRepo.find();

            res.json({
                status: "Success",
                payments,
                length: payments.length
            });
        }
    });

    app.get("/products", async function(req: Request, res: Response) {
        const products = await productsRepo.find();

        res.json({
            status: "Success",
            products,
            length: products.length
        });
    });

    app.get("/items", async function(req: Request, res: Response) {
        const orderItems = await orderItemsRepo.find();

        res.json({
            status: "Success",
            orderItems,
            length: orderItems.length
        });
    });

    app.get("/paid", async function(req: Request, res: Response) {
        let ordersFiltered = [];

        const orders = await ordersRepo.find({
            relations: ["order_payments", "order_items"],
            where: {
                order_payments: []
            }
        });

        for (const item of orders) {
            if (helper.orderPaid(item)) {
                ordersFiltered.push(item);
            }
        }

        res.json({
            status: "Success",
            orders: ordersFiltered,
            length: ordersFiltered.length
        });
    });

    app.get("/nonpaid", async function(req: Request, res: Response) {
        let ordersFiltered = [];

        const orders = await ordersRepo.find({
            relations: ["order_payments", "order_items"],
            where: {
                order_payments: []
            }
        });

        for (const item of orders) {
            if (!helper.orderPaid(item)) {
                ordersFiltered.push(item);
            }
        }

        res.json({
            status: "Success",
            orders: ordersFiltered,
            length: ordersFiltered.length
        });
    });

    app.post("/recordPayment", async function(req: Request, res: Response) {
        if (req.query.orderNo && req.query.desc && req.query.amount) {
            const order = await ordersRepo.findOne({
                relations: ["order_payments"],
                where: {
                    order_no: req.query.orderNo
                }
            });

            if (helper.orderPaid(order)) {
                res.json({
                    status: "Failure",
                    message: "Order already paid in full"
                });
            } else {
                rabbit.publish("", "payments", Buffer.from(JSON.stringify(req.query)));
                res.json({
                    status: "Success",
                    message: "Payment added to processing queue"
                });
            }
        } else {
            res.json({
                status: "Failure",
                message: "Parameters not provided"
            });
        }
    });
};