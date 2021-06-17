import "reflect-metadata";
import * as routes from "./routes";
import {createConnection, getRepository} from "typeorm";
import * as express from "express";

import {Products} from "./entity/Products";
import {Orders} from "./entity/Orders";
import {OrderPayments} from "./entity/OrderPayments";
import {OrderItems} from "./entity/OrderItems";

const port = 3000;
const helpers = require('../src/helpers/index');
const rabbit = require('../src/helpers/rabbit');

createConnection().then(async connection => {
    const app = express();
    const ordersRepo = getRepository(Orders);
    const productsRepo = getRepository(Products);
    const orderItemsRepo = getRepository(OrderItems);
    const paymentsRepo = getRepository(OrderPayments);

    app.use(express.json());
    routes.register( app );

    await helpers.readDataFromFile('data.json', ordersRepo, productsRepo, orderItemsRepo, paymentsRepo);
    await rabbit.start(paymentsRepo);

    app.listen(port, () => {
        console.log(`DPO Payments listening at http://localhost:${port}`)
    });
}).catch(error => console.log(error));
