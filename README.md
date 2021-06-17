# Welcome to DPO Paygate, Build with TypeORM

Steps to run this project:

1. Run `npm i` command
2. Setup database settings inside `ormconfig.json` file
3. Run `npm start` command

## Task 1 (Report Creation)
### Requirements:

1. You must use MySQL database to store your data ( add username, password and database in ormconfig.json)
2. You must use TypeORM to build your reports
3. You must use express to serve API calls

### Task:

1. Your database needs to look like the ER diagram provided in ER.PNG file
2. Insert the data provided in data.json into your database
3. Generate TWO reports:
		Create two endpoints: 
			``/paid ``
			``nonpaid``
One to return all orders that have been paid and another to find all orders that has no payment attempted.

## Task 2 (RabbitMQ - Publisher and Consumer)

### Requirements:

1. This Task requires you to understand and complete Task 1

2. This task needs a rabbitMQ server running( You have three optuions)
	a. Install rabbitMQ following the link (https://www.rabbitmq.com/download.html)
	b. Install Via docker https://hub.docker.com/_/rabbitmq/
	c. Use https://www.cloudamqp.com/plans.html scroll down to the free plan. Setup an account and use development purposes.
	
3. You are required to add rabbit dependencies yourself. (https://www.rabbitmq.com/tutorials/tutorial-one-javascript.html)

### Task:

Using the database in the previous section, create an API endpoint that allows you to do a payment on one of the orders that does not have a successful payment.
(you can dummy out the payment process part). You then need to publish this data onto a rabbit queue and consume this message and insert a payment record for 
that specific order.