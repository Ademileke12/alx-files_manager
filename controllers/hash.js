const sha1 = require('sha1');
const { v4: uuidv4 } = require('uuid');
const DBClient = require('../utils/db');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const db = DBClient.connection;
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Already exists' });
    }

    const hashedPassword = sha1(password);
    const newUser = {
      email,
      password: hashedPassword,
      _id: uuidv4(),
    };

    await usersCollection.insertOne(newUser);

    return res.status(201).json({ email: newUser.email, id: newUser._id });
  }
}

module.exports = UsersController;
