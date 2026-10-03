
require ('dotenv').config();
const express =require('express');
const cors =require ('cors');
const {Pool} = require('pg');

const app=express();
const port =3000;

app.use(cors());
app.use(express.json());

const pool =new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT

});

app.get('/api/expenses', async function (req, res) {
  try {
    let result = await pool.query(
      `SELECT id, title, amount::float8 AS amount, category, to_char(date, 'YYYY-MM-DD') AS date
       FROM expenses
       ORDER BY id`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get('/api/expenses/:id', async function (req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ message: "Expense not found" });
  }

  try {
    let result = await pool.query(
      `SELECT id, title, amount::float8 AS amount, category, to_char(date, 'YYYY-MM-DD') AS date
       FROM expenses
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post('/api/expenses', async function (req, res) {
  const { title, amount, category, date } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ message: "Amount must be a number greater than 0" });
  }

  const allowedCategories = ["Food", "Transport", "Bills", "Entertainment", "Other"];

  if (!allowedCategories.includes(category)) {
    return res.status(400).json({ message: "Category must be one of: Food, Transport, Bills, Entertainment, Other" });
  }

  if (!date) {
    return res.status(400).json({ message: "Date is required" });
  }

  try {
    let result = await pool.query(
      `INSERT INTO expenses (title, amount, category, date)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, amount::float8 AS amount, category, to_char(date, 'YYYY-MM-DD') AS date`,
      [title, amount, category, date]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put('/api/expenses/:id', async function (req, res) {
  const id = Number(req.params.id);
  const { title, amount, category, date } = req.body;

  if (!Number.isInteger(id)) {
    return res.status(404).json({ message: "Expense not found" });
  }

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ message: "Amount must be a number greater than 0" });
  }

  const allowedCategories = ["Food", "Transport", "Bills", "Entertainment", "Other"];

  if (!allowedCategories.includes(category)) {
    return res.status(400).json({ message: "Category must be one of: Food, Transport, Bills, Entertainment, Other" });
  }

  if (!date) {
    return res.status(400).json({ message: "Date is required" });
  }

  try {
    let result = await pool.query(
      `UPDATE expenses
       SET title = $1, amount = $2, category = $3, date = $4
       WHERE id = $5
       RETURNING id, title, amount::float8 AS amount, category, to_char(date, 'YYYY-MM-DD') AS date`,
      [title, amount, category, date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


app.delete('/api/expenses/:id', async function (req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ message: "Expense not found" });
  }

  try {
    let result = await pool.query(
      `DELETE FROM expenses WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense deleted", id: result.rows[0].id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(port,function(){
    console.log(`Server running at http://localhost:${port}`)
})