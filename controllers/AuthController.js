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

module.exports = AuthController;
