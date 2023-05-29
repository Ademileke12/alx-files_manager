import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import crypto from 'crypto';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const userExists = await dbClient.connection
      .collection('users')
      .findOne({ email });

    if (userExists) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = crypto
      .createHash('sha1')
      .update(password)
      .digest('hex');

    const newUser = {
      email,
      password: hashedPassword,
    };

    const result = await dbClient.connection
      .collection('users')
      .insertOne(newUser);

    return res
      .status(201)
      .json({ id: result.insertedId.toString(), email });
  }
}

export default UsersController;
