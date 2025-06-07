const mysql = require("mysql2");
const bcrypt = require('bcryptjs');

const db = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD, 
  database: process.env.DATABASE
});

exports.signup = (req, res) => {
  const { name, email, password, passwordConfirm } = req.body;

  if (password !== passwordConfirm) {
    return res.json({ success: false, message: "Passwords do not match" });
  }

  db.query('SELECT email FROM users WHERE email = ?', [email], (error, results) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (results.length > 0) {
      return res.json({ success: false, message: 'Email already registered' });
    }

    db.query(
      'INSERT INTO users(username, email, password) VALUES (?, ?, ?)',
      [name, email, password],
      (error, results) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ success: false, message: 'Database error' });
        }
        return res.json({ success: true });
      }
    );
  });
};

exports.login = (req, res) => {
  const { email, password} = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (results.length === 0) {
      return res.json({ success: false, message: "Incorrect email or password" });
    }
    if (results[0].password !== password) {
      return res.json({ success: false, message: "Incorrect email or password" });
    }

    const user = results[0];

    req.session.user = {
      id: user.id,
      name: user.username,
      email: user.email,
      role: user.role 
    };

    res.json({ success: true, role: user.role });
  });
};

exports.getUser = (req, res) => {
  if (req.session.user) {
    res.json({ name: req.session.user.name });
  } else {
    res.status(401).json({ error: "Not logged in" });
  }
};

exports.getbank_id = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }

  const userId = req.session.user.id;

  db.query('SELECT bank_id FROM users WHERE id = ?', [userId], (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ bank_id: results[0].bank_id });
  });
};

exports.getBalance = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }

  const userId = req.session.user.id;
  const db = req.app.locals.db;

  db.query('SELECT balance FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      res.json({ balance: results[0].balance });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });
};

exports.transfer = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }

  const senderId = req.session.user.id;
  const { username, email, amount } = req.body;

  if (!username || !email || !amount || amount <= 0) {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }

  const db = req.app.locals.db;

  db.getConnection((err, connection) => {
    if (err) {
      console.error("DB connection error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    connection.beginTransaction(err => {
      if (err) {
        connection.release();
        console.error("Transaction error:", err);
        return res.status(500).json({ success: false, message: "Database error" });
      }


      connection.query(
        'SELECT id, balance FROM users WHERE username = ? AND email = ?',
        [username, email],
        (err, results) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              console.error("Recipient query error:", err);
              res.status(500).json({ success: false, message: "Database error" });
            });
          }

          if (results.length === 0) {
            return connection.rollback(() => {
              connection.release();
              res.status(404).json({ success: false, message: "Recipient not found" });
            });
          }

          const recipient = results[0];


          connection.query(
            'SELECT balance FROM users WHERE id = ?',
            [senderId],
            (err, results) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  console.error("Sender balance query error:", err);
                  res.status(500).json({ success: false, message: "Database error" });
                });
              }

              if (results.length === 0) {
                return connection.rollback(() => {
                  connection.release();
                  res.status(404).json({ success: false, message: "Sender not found" });
                });
              }

              const senderBalance = results[0].balance;

              if (senderBalance < amount) {
                return connection.rollback(() => {
                  connection.release();
                  res.status(400).json({ success: false, message: "Insufficient balance" });
                });
              }


              connection.query(
                'UPDATE users SET balance = balance - ? WHERE id = ?',
                [amount, senderId],
                (err) => {
                  if (err) {
                    return connection.rollback(() => {
                      connection.release();
                      console.error("Deduct sender balance error:", err);
                      res.status(500).json({ success: false, message: "Database error" });
                    });
                  }


                  connection.query(
                    'UPDATE users SET balance = balance + ? WHERE id = ?',
                    [amount, recipient.id],
                    (err) => {
                      if (err) {
                        return connection.rollback(() => {
                          connection.release();
                          console.error("Add recipient balance error:", err);
                          res.status(500).json({ success: false, message: "Database error" });
                        });
                      }

        
                      connection.query(
                        'INSERT INTO transactions (sender_id, recipient_id, amount) VALUES (?, ?, ?)',
                        [senderId, recipient.id, amount],
                        (err) => {
                          if (err) {
                            return connection.rollback(() => {
                              connection.release();
                              console.error("Insert transaction error:", err);
                              res.status(500).json({ success: false, message: "Database error" });
                            });
                          }

       
                          connection.commit(err => {
                            connection.release();
                            if (err) {
                              console.error("Commit error:", err);
                              return res.status(500).json({ success: false, message: "Database error" });
                            }

                            res.json({ success: true, message: `Transferred Rs. ${amount} to ${username}` });
                          });
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  });
};



  

exports.getTransactionHistory = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }

  const userId = req.session.user.id;
  const db = req.app.locals.db;

  const query = `
    SELECT
      t.id,
      t.amount,
      t.transaction_time,
      sender.username AS senderName,
      sender.email AS senderEmail,
      recipient.username AS recipientName,
      recipient.email AS recipientEmail,
      CASE
        WHEN t.sender_id = ? THEN 'Sent'
        ELSE 'Received'
      END AS transactionType
    FROM transactions t
    JOIN users sender ON t.sender_id = sender.id
    JOIN users recipient ON t.recipient_id = recipient.id
    WHERE t.sender_id = ? OR t.recipient_id = ?
    ORDER BY t.transaction_time DESC
  `;

  db.query(query, [userId, userId, userId], (err, results) => {
    if (err) {
      console.error("Transaction history query error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    res.json({ success: true, transactions: results });
  });
};

exports.getAllUsers = (req, res) => {
  if (!req.session.user ) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const search = req.query.search;
  let query = 'SELECT id, username, email, bank_id, role, balance FROM users';
  let params = [];

  if (search) {
    query += ' WHERE bank_id = ? OR username LIKE ?';
    params = [search, `%${search}%`];
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, users: results });
  });
};

exports.getretrieve = (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(401).json({ success: false, message: "Not logged in as admin" });
  }

  const { username, email, amount } = req.body;

  if (!username || !email || !amount || amount <= 0) {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }

  const adminId = req.session.user.id; // admin is logged in here
  const db = req.app.locals.db;

  db.getConnection((err, connection) => {
    if (err) {
      console.error("DB connection error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    connection.beginTransaction(err => {
      if (err) {
        connection.release();
        console.error("Transaction error:", err);
        return res.status(500).json({ success: false, message: "Database error" });
      }

      // Find user to refund from (sender)
      connection.query(
        'SELECT id, balance FROM users WHERE username = ? AND email = ?',
        [username, email],
        (err, results) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              console.error("User query error:", err);
              res.status(500).json({ success: false, message: "Database error" });
            });
          }

          if (results.length === 0) {
            return connection.rollback(() => {
              connection.release();
              res.status(404).json({ success: false, message: "User not found" });
            });
          }

          const user = results[0];

          if (user.balance < amount) {
            return connection.rollback(() => {
              connection.release();
              res.status(400).json({ success: false, message: "User has insufficient balance" });
            });
          }

          // Deduct from user (sender)
          connection.query(
            'UPDATE users SET balance = balance - ? WHERE id = ?',
            [amount, user.id],
            (err) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  console.error("Deduct user balance error:", err);
                  res.status(500).json({ success: false, message: "Database error" });
                });
              }

              // Add to admin (recipient)
              connection.query(
                'UPDATE users SET balance = balance + ? WHERE id = ?',
                [amount, adminId],
                (err) => {
                  if (err) {
                    return connection.rollback(() => {
                      connection.release();
                      console.error("Add admin balance error:", err);
                      res.status(500).json({ success: false, message: "Database error" });
                    });
                  }

                  // Insert transaction: user → admin
                  connection.query(
                    'INSERT INTO transactions (sender_id, recipient_id, amount) VALUES (?, ?, ?)',
                    [user.id, adminId, amount],
                    (err) => {
                      if (err) {
                        return connection.rollback(() => {
                          connection.release();
                          console.error("Insert transaction error:", err);
                          res.status(500).json({ success: false, message: "Database error" });
                        });
                      }

                      connection.commit(err => {
                        connection.release();
                        if (err) {
                          console.error("Commit error:", err);
                          return res.status(500).json({ success: false, message: "Database error" });
                        }

                        res.json({ success: true, message: `Received Rs. ${amount} from ${username}` });
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  });
};



exports.getUsersTransactionHistory = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }

  const userId = req.session.user.id;
  const db = req.app.locals.db;

  // Extract query filters
  let { username, email, type, amountMin, amountMax } = req.query;

  // Normalize type to lowercase for consistent comparison
  if (type) type = type.toLowerCase();

  // Base query and params
  let query = `
    SELECT
      t.id,
      t.amount,
      t.transaction_time,
      sender.username AS senderName,
      sender.email AS senderEmail,
      recipient.username AS recipientName,
      recipient.email AS recipientEmail,
      CASE WHEN t.sender_id = ? THEN 'Sent' ELSE 'Received' END AS transactionType
    FROM transactions t
    JOIN users sender ON t.sender_id = sender.id
    JOIN users recipient ON t.recipient_id = recipient.id
    WHERE (t.sender_id = ? OR t.recipient_id = ?)
  `;

  const params = [userId, userId, userId];

  // Filter by type (Sent or Received)
  if (type === 'sent') {
    query += ' AND t.sender_id = ?';
    params.push(userId);
  } else if (type === 'received') {
    query += ' AND t.recipient_id = ?';
    params.push(userId);
  }

  // Filter by username (matches sender or recipient)
  if (username) {
    query += ' AND (sender.username LIKE ? OR recipient.username LIKE ?)';
    params.push(`%${username}%`, `%${username}%`);
  }

  // Filter by email (matches sender or recipient)
  if (email) {
    query += ' AND (sender.email LIKE ? OR recipient.email LIKE ?)';
    params.push(`%${email}%`, `%${email}%`);
  }

  // Filter by minimum amount
  if (amountMin && !isNaN(amountMin)) {
    query += ' AND t.amount >= ?';
    params.push(Number(amountMin));
  }

  // Filter by maximum amount
  if (amountMax && !isNaN(amountMax)) {
    query += ' AND t.amount <= ?';
    params.push(Number(amountMax));
  }

  query += ' ORDER BY t.transaction_time DESC';

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Transaction history query error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    // Format data to send relevant info depending on type
    const formattedResults = results.map(tx => ({
      name: tx.transactionType === 'Sent' ? tx.recipientName : tx.senderName,
      email: tx.transactionType === 'Sent' ? tx.recipientEmail : tx.senderEmail,
      amount: tx.amount,
      type: tx.transactionType,
      time: tx.transaction_time
    }));

    res.json({ success: true, transactions: formattedResults });
  });
};


exports.assignRole = (req, res) => {
  const { username, email, role } = req.body;

  if (!username || !email || !role) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const allowedRoles = ['Customer', 'Clerk']; // Your actual roles from the dropdown
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role specified' });
  }

  // Find the user first
  const selectQuery = 'SELECT id FROM users WHERE username = ? AND email = ?';
  db.query(selectQuery, [username, email], (err, results) => {
    if (err) {
      console.error("Select user error:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userId = results[0].id;

    // Now update role
    db.query('UPDATE users SET role = ? WHERE id = ?', [role, userId], (err, result) => {
      if (err) {
        console.error("Update role error:", err);
        return res.status(500).json({ success: false, message: 'Role update failed' });
      }

      res.json({ success: true, message: `Role updated to ${role} for ${username}` });
    });
  });
};

exports.deleteUser = (req, res) => {
  const db = req.app.locals.db;
  const { email } = req.body;
  console.log("➡️ deleteUser called, email:", email);

  if (!email) {
    console.log("❗ Missing email");
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  db.query('SELECT id FROM users WHERE email = ?', [email], (err, users) => {
    if (err) {
      console.error("❌ SELECT error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    if (users.length === 0) {
      console.log("⚠️ User not found");
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userId = users[0].id;

    db.query('DELETE FROM users WHERE id = ?', [userId], (err2) => {
      if (err2) {
        console.error("❌ DELETE error:", err2);
        return res.status(500).json({ success: false, message: "Error deleting user" });
      }

      console.log("✅ User deleted successfully");
      res.json({ success: true, message: "User account deleted successfully" });
    });
  });
};


