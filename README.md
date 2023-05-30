##
# MERN Shop :shopping_cart:

MERN Shop is a full-stack e-commerce web app built with Node.js, Express.js, MongoDB, and EJS. It allows users to browse and buy products online, as well as manage their orders and profiles. It also has an admin panel for managing products, users, and orders.

## Features :sparkles:

- Product display with pagination, search, and filter
- Product reviews and ratings
- Shopping cart and checkout functionality
- PayPal payment integration
- User authentication and authorization
- User profile and order history
- Admin dashboard for product, user, and order management

## Installation :wrench:

To install the project, you need to have Node.js and npm installed on your machine. Then, clone the project from GitHub and run the following commands:

```bash
# Install dependencies for server
npm install

# Install dependencies for client
npm run client-install

# Run the client & server with concurrently
npm run dev

# Run the Express server only
npm run server

# Run the React client only
npm run client
```

## Usage :computer:

To use the project, you can either register as a new user or log in as an existing user. You can browse the products, add them to your cart, and proceed to checkout. You can also view your order history and profile. If you are an admin user, you can also manage the products, users, and orders.

Here is a screenshot of the app:

![MERN Shop Screenshot](https://drive.google.com/uc?export=view&id=1oJk-qIIa2tPs1dOpra6upvOTjfKIgJSi)

## Technologies :hammer_and_wrench:

The following technologies were used to build this project:

| Front-end | Back-end | Database | Other |
|-----------|----------|----------|-------|
| HTML      | Node     | MongoDB  | bcryptjs |
| CSS       | Express  |          | colors |
| EJS       |          |          | dotenv |
|           |          |          | express-async-handler |
|           |          |          | jsonwebtoken |
|           |          |          | morgan |
|           |          |          | multer |
|           |          |          | concurrently |
|           |          |          | nodemon |
|           |          |          | stripe-api |
|           |          |          | mongoose |
|           |          |          | pdfkit |

## License :page_facing_up:

This project is licensed under the MIT License.
