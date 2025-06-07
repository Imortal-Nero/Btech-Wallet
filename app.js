const express = require("express");
const path = require('path');
const mysql = require("mysql2");
const dotenv = require("dotenv");
const session = require('express-session');
const events = require('events');

dotenv.config({ path: './.env' });

// Increase max listeners globally to avoid MaxListenersExceededWarning
events.EventEmitter.defaultMaxListeners = 20;

const app = express();

// Setup MySQL connection pool
const db = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD, 
  database: process.env.DATABASE
});

// Test DB connection
db.getConnection((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("MYSQL CONNECTED...");
  }
});

// Serve static frontend files
const publicDirectory = path.join(__dirname, './Frontend');
app.use(express.static(publicDirectory));

// Session middleware
app.use(session({
  secret: process.env.SECRET_KEY || 'your_secret_key',  
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// Middleware to parse form and JSON data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Make db accessible in req.app.locals.db
app.locals.db = db;

// Routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth')); // includes userstransactions route

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port http://localhost:${PORT}`);
});
