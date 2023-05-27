<<<<<<< HEAD
const sha1 = require('sha1');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Check if email is missing
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    // Check if password is missing
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      // Check if email already exists in the database
      const existingUser = await dbClient.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Already exists' });
      }

      // Hash the password using SHA1
      const hashedPassword = sha1(password);

      // Create a new user object
      const newUser = {
        email,
        password: hashedPassword,
      };

      // Save the new user in the "users" collection
      const result = await dbClient.db.collection('users').insertOne(newUser);

      // Return the newly created user with email and id
      const { _id } = result.insertedId;
      const createdUser = {
        email,
        id: _id,
      };

      return res.status(201).json(createdUser);
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await dbClient.getUserById(userId);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      return res.json({ email: user.email, id: user.id });
    } catch (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
=======
import sha1 from 'sha1';
import { ObjectID } from 'mongodb';
import Queue from 'bull';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const userQueue = new Queue('userQueue', 'redis://127.0.0.1:6379');

class UsersController {
  static postNew(request, response) {
    const { email } = request.body;
    const { password } = request.body;

    if (!email) {
      response.status(400).json({ error: 'Missing email' });
      return;
    }
    if (!password) {
      response.status(400).json({ error: 'Missing password' });
      return;
    }

    const users = dbClient.db.collection('users');
    users.findOne({ email }, (err, user) => {
      if (user) {
        response.status(400).json({ error: 'Already exist' });
      } else {
        const hashedPassword = sha1(password);
        users.insertOne(
          {
            email,
            password: hashedPassword,
          },
        ).then((result) => {
          response.status(201).json({ id: result.insertedId, email });
          userQueue.add({ userId: result.insertedId });
        }).catch((error) => console.log(error));
      }
    });
  }

  static async getMe(request, response) {
    const token = request.header('X-Token');
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (userId) {
      const users = dbClient.db.collection('users');
      const idObject = new ObjectID(userId);
      users.findOne({ _id: idObject }, (err, user) => {
        if (user) {
          response.status(200).json({ id: userId, email: user.email });
        } else {
          response.status(401).json({ error: 'Unauthorized' });
        }
      });
    } else {
      console.log('Hupatikani!');
      response.status(401).json({ error: 'Unauthorized' });
>>>>>>> e81b84c9beced44f3f1d283e3a576d32709e2d10
    }
  }
}

module.exports = UsersController;
