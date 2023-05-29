import crypto from 'crypto';
import dbClient from '../utils/db';

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

  static async getMe(req, res) {
    const token = req.header('X-Token') || '';

    const user = await dbClient.getUserByToken(token);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { email, _id } = user;

    return res.status(200).json({ email, id: _id });
  }
}

export default UsersController;
