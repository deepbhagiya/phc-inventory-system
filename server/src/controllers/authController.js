const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { username, password, fullName, role } = req.body;
    let user = await User.findOne({ where: { username } });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = await User.create({ username, password, fullName, role });
    
    // Create token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, role: user.role });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) {
      console.log(`Login failed: User not found (${username})`);
      return res.status(401).json({ message: 'Invalid Credentials: User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Login failed: Password mismatch for ${username}`);
      return res.status(401).json({ message: 'Invalid Credentials: Password mismatch' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, role: user.role });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user.id, { attributes: { exclude: ['password'] } });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
