<<<<<<< HEAD
const { v4: uuidv4 } = require('uuid');

const AuthController = {
  getConnect(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const encodedCredentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(encodedCredentials, 'base64').toString();
    const [email, password] = credentials.split(':');

    const user = dbClient.getUserByEmail(email);
    if (!user || user.password !== sha1(password)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = uuidv4();
    const key = `auth_${token}`;
    redisClient.set(key, user._id.toString(), 'EX', 24 * 60 * 60); // Set token with 24-hour expiration

    return res.status(200).json({ token });
  },

  getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    redisClient.del(`auth_${token}`);
    return res.status(204).send();
  },
};
=======
import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(request, response) {
    const authData = request.header('Authorization');
    let userEmail = authData.split(' ')[1];
    const buff = Buffer.from(userEmail, 'base64');
    userEmail = buff.toString('ascii');
    const data = userEmail.split(':'); // contains email and password
    if (data.length !== 2) {
      response.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const hashedPassword = sha1(data[1]);
    const users = dbClient.db.collection('users');
    users.findOne({ email: data[0], password: hashedPassword }, async (err, user) => {
      if (user) {
        const token = uuidv4();
        const key = `auth_${token}`;
        await redisClient.set(key, user._id.toString(), 60 * 60 * 24);
        response.status(200).json({ token });
      } else {
        response.status(401).json({ error: 'Unauthorized' });
      }
    });
  }

  static async getDisconnect(request, response) {
    const token = request.header('X-Token');
    const key = `auth_${token}`;
    const id = await redisClient.get(key);
    if (id) {
      await redisClient.del(key);
      response.status(204).json({});
    } else {
      response.status(401).json({ error: 'Unauthorized' });
    }
  }
}
>>>>>>> e81b84c9beced44f3f1d283e3a576d32709e2d10

module.exports = AuthController;
