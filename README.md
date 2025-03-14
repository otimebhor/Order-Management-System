<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Order Management System

A NestJS-based Order Management System with microservices architecture.

## Features

- User management (create, retrieve users and their orders)
- Product management (create, retrieve products and inventory)
- Order processing with microservices architecture
- JWT Authentication and Authorization
- API Documentation with Swagger
- Rate limiting for API protection
- Database transactions for data integrity

## Tech Stack

- **NestJS**: Progressive Node.js framework
- **TypeORM**: ORM for database interactions with PostgreSQL
- **RabbitMQ**: Message broker for microservices communication
- **JWT**: JSON Web Tokens for authentication
- **Swagger**: API documentation
- **Jest**: Testing framework

## Prerequisites

- Node.js (v16+)
- PostgreSQL (if running locally)
- RabbitMQ (if running locally)



1. Clone the repository:
```bash
git clone https://github.com/yourusername/order-management.git
cd order-management
```

2. Install dependencies
```bash
$ npm install
```

3. Set up environment variables

Create a .env file in the root directory and configure the following environment variables:

```bash
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
JWT_SECRET=your_jwt_secret_key
```
- DATABASE_URL: The URL of your PostgreSQL database.
- secret: A secret key for signing JWT tokens.

4. Run database migrations
```bash
npm run migration:run 
```
4. Start PostgreSQL, RabbitMQ,  locally or update the `.env` file with remote connections.

5. Start the main application:
```bash
npm run start:dev
```

6. Start the orders microservice in a separate terminal:
```bash
npm run start:orders-microservice
```
The application should now be running at http://localhost:3025.

## API Documentation
The API Documentation can be found and tested on [Swagger] (http://localhost:3025/api)


## API Documentation

Swagger documentation is available at http://localhost:3000/api when the application is running.

### Main Endpoints

#### Authentication
- `POST /auth/login` - Login with email and password

#### Users
- `POST /users` - Create a new user
- `GET /users/:id` - Get user details
- `GET /users/:id/orders` - Get all orders for a user

#### Products
- `POST /products` - Create a new product
- `GET /products/:id` - Get product details
- `GET /products` - Get all products

#### Orders
- `POST /orders` - Create a new order
- `GET /orders/:id` - Get order details
- `GET /orders` - Get all orders

## Testing

Run unit tests:
```bash
npm run test
```

Run e2e tests:
```bash
npm run test:e2e
```



## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
