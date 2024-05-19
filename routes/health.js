const express = require('express');
const { db } = require('../db/db');

const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    await db.raw('select 1+1 as result');
    res.json({ status: 'ok', message: 'Database connected successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Unable to connect to the database', error: error.message });
  }
});

module.exports = router;
