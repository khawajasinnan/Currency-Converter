require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Routes
app.post('/api/conversions', async (req, res) => {
    try {
        const { from, to, amount, result, rate } = req.body;
        const [rows] = await pool.execute(
            'INSERT INTO conversion_history (from_currency, to_currency, amount, result, rate) VALUES (?, ?, ?, ?, ?)',
            [from, to, amount, result, rate]
        );
        res.status(201).json({ id: rows.insertId, ...req.body });
    } catch (error) {
        console.error('Error saving conversion:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/conversions', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM conversion_history ORDER BY timestamp DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching conversions:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/conversions', async (req, res) => {
    try {
        await pool.execute('TRUNCATE TABLE conversion_history');
        res.status(200).json({ message: 'All conversion history deleted' });
    } catch (error) {
        console.error('Error clearing conversions:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/rates', async (req, res) => {
    try {
        const { currency, rate } = req.body;
        await pool.execute(
            'INSERT INTO currency_rates (currency, rate) VALUES (?, ?) ON DUPLICATE KEY UPDATE rate = ?, last_updated = CURRENT_TIMESTAMP',
            [currency, rate, rate]
        );
        res.status(201).json({ message: 'Rate updated successfully' });
    } catch (error) {
        console.error('Error updating rate:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/rates', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM currency_rates');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching rates:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 