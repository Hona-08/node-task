const jwt = require('jsonwebtoken');
const { findUserById } = require('../models/user');

const authenticateToken = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserById(decoded.id);
    if (!user) return res.sendStatus(403);

    req.user = user;
    next();
  } catch (err) {
    res.sendStatus(403);
  }
};

const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).send('Access denied');
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRole };
