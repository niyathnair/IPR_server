const express = require('express');
const cors = require('cors');
const pool = require("./database");
// const si = require('systeminformation');

const app = express();

app.use(express.json());
app.use(cors());

// Existing user management and task endpoints

app.post("/adduser", async (req, res) => {
    const { handle, email, password, employee_id } = req.body;

    try {
        if (employee_id) {
            const insertManagerSTMT = `INSERT INTO managers (handle, email, password) VALUES ($1, $2, $3) RETURNING *`;
            const result = await pool.query(insertManagerSTMT, [handle, email, password]);
            res.send("Manager added successfully");
        } else {
            const insertInternSTMT = `INSERT INTO register (handle, email, password) VALUES ($1, $2, $3) RETURNING *`;
            const result = await pool.query(insertInternSTMT, [handle, email, password]);
            res.send("Intern added successfully");
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Error saving data");
    }
});

app.post("/login", async (req, res) => {
    const { handleOrEmail, password, employee_id } = req.body;

    try {
        if (employee_id) {
            const userQuery = `SELECT * FROM managers WHERE handle = $1 OR email = $2`;
            const result = await pool.query(userQuery, [handleOrEmail, handleOrEmail]);

            if (result.rows.length > 0) {
                const user = result.rows[0];

                if (password === user.password) {
                    res.send({ success: true, handle: user.handle, isManager: true });
                } else {
                    res.send({ success: false, message: 'Invalid handle/email or password' });
                }
            } else {
                res.send({ success: false, message: 'Invalid handle/email or password' });
            }
        } else {
            const userQuery = `SELECT * FROM register WHERE handle = $1 OR email = $2`;
            const result = await pool.query(userQuery, [handleOrEmail, handleOrEmail]);

            if (result.rows.length > 0) {
                const user = result.rows[0];

                if (password === user.password) {
                    res.send({ success: true, handle: user.handle, isManager: false });
                } else {
                    res.send({ success: false, message: 'Invalid handle/email or password' });
                }
            } else {
                res.send({ success: false, message: 'Invalid handle/email or password' });
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Error logging in");
    }
});

app.post("/tasks", async (req, res) => {
    const { handle, name, briefDescription, detailedDescription, students } = req.body;

    try {
        const insertTaskQuery = `
            INSERT INTO tasks (handle, name, briefDescription, detailedDescription, students)
            VALUES ($1, $2, $3, $4, $5) RETURNING *`;
        const result = await pool.query(insertTaskQuery, [handle, name, briefDescription, detailedDescription, students]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding task");
    }
});

app.get("/tasks/:handle", async (req, res) => {
    const { handle } = req.params;

    try {
        const getTasksQuery = `SELECT * FROM tasks WHERE handle = $1`;
        const result = await pool.query(getTasksQuery, [handle]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching tasks");
    }
});

// New endpoint to fetch system statistics
app.get('/stats', async (req, res) => {
    try {
      const cpu = await si.currentLoad();
      const mem = await si.mem();
      const processes = await si.processes();
      
      // Filter out system processes, assuming user applications typically have higher PIDs and are not running as system/root user
      const userProcesses = processes.list.filter(p => p.pcpu > 0.1 && p.name);
  
      // Add network usage data
      const networkStats = await si.networkStats();
      const networkUsage = networkStats.map(n => ({
        iface: n.iface,
        rx_bytes: n.rx_bytes,
        tx_bytes: n.tx_bytes,
        rx_sec: n.rx_sec,
        tx_sec: n.tx_sec,
      }));
  
      res.json({
        cpu: cpu.currentLoad,
        memory: {
          total: mem.total,
          free: mem.free,
          used: mem.used
        },
        processes: userProcesses,
        network: networkUsage,   
      });
    } catch (err) {
      res.status(500).send("Error fetching system stats");
    }
  });
  
  app.listen(4000, () => console.log("Server is running on http://localhost:4000"));
  
  module.exports = app;