const fs = require('fs');

async function readDataFromFile(urlPath: string, ordersRepo, productsRepo, orderItemsRepo, paymentsRepo) {
    let rawData = fs.readFileSync(urlPath);
    let parsedData = JSON.parse(rawData);

    for (const item of parsedData) {
        const order = await createOrder(item, ordersRepo);

        if (item.hasOwnProperty("items")) {
            for (const subItem of item.items) {
                const product = await createProduct(subItem, productsRepo);
                await createOrderItem(product, order, orderItemsRepo);
            }
        }

        if (item.hasOwnProperty("payments")) {
            await createPayment(item, order, paymentsRepo);
        }
    }
}

async function createOrder(item, ordersRepo) {
    const order = ordersRepo.create({
        order_no: item.orderId,
        amount: item.amount,
        desc: item.desc,
        date_created: (new Date(item.created)).toLocaleDateString(),
        status: '0'
    });

    await ordersRepo.save(order).catch((err) => {
        console.log("Error: ", err);
    });
    console.log("New order saved", order);

    return order;

}

async function createProduct(subItem, productsRepo) {
    const product = productsRepo.create(subItem.product);

    await productsRepo.save(product).catch((err) => {
        console.log("Error: ", err);
    });
    console.log("New product saved", product);

    return product;
}

async function createOrderItem(product, order, orderItemsRepo) {
    const orderItem = orderItemsRepo.create({
        product: product,
        order: order
    });

    await orderItemsRepo.save(orderItem).catch((err) => {
        console.log("Error: ", err);
    });
    console.log("New order item saved", orderItem);

    return orderItem;
}

async function createPayment(item, order, paymentsRepo) {
    for (const subItem of item.payments) {
        const payment = paymentsRepo.create({
            status: subItem.status,
            status_desc: subItem.statusDesc,
            amount: subItem.amount,
            order: order
        });

        await paymentsRepo.save(payment).catch((err) => {
            console.log("Error: ", err);
        });
        console.log("New payment saved", payment);
    }
}

function orderPaid(order) {
    if (!order) {
        return false;
    }

    let orderBalance = Number(order.amount);

    for (const payment of order.order_payments) {
        if (payment.status_desc === "Payed") {
            orderBalance = orderBalance - Number(payment.amount);
        }
    }

    if (orderBalance <= 0) {
        return true;
    } else {
        return false;
    }
}

module.exports = { readDataFromFile, orderPaid };