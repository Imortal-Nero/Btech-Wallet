# Btech-Wallet

A simple web-based user hierarchy bank management system.

## Features

- User, clerk and admin login system  
- View user balances and transaction history  
- Perform credit and debit operations  
- Session-based authentication with JWT and cookies  
- MySQL-based backend  
- Built with Node.js and Express.js  

## Prerequisites

- **Node.js** (v14 or higher)
- **MySQL** server

## Database

- Run mysql.sql commands and create a databse

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/Btech-Wallet.git
   cd Btech-Wallet
2. **Initialize and install dependencies:**
   ```bash
   npm init
   npm install
3. **Need to install :**
    ```bash
    npm install cookie-parser@^1.4.7
    npm install express@^5.1.0
    npm install express-session@^1.18.1
    npm install jsonwebtoken@^9.0.2
    npm install mysql2@^3.14.1
    npm install nodemon
4.  **Configure environment variables:**
  Create a .env file in the root directory and add your MySQL configuration:
    ```bash
      DATABASE = myapp
      DATABASE_HOST = localhost
      DATABASE_USER = root
      DATABASE_PASSWORD =
      SECRET_KEY = 1445
5.  **Start the development server:** 
    ```bash
    npm start
6.  **Access the app in your browser:**
   ```bash
   http://localhost:5000
 


   
