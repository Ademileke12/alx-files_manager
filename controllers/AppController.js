const DBClient = require('../utils/db');

class AppController {
  static async getStatus(req, res) {
    const redisStatus = await DBClient.isAlive('redis');
    const dbStatus = await DBClient.isAlive('db');

    res.status(200).json({ redis: redisStatus, db: dbStatus });
  }

  static async getStats(req, res) {
    const nbUsers = await DBClient.nbUsers();
    const nbFiles = await DBClient.nbFiles();

    res.status(200).json({ users: nbUsers, files: nbFiles });
  }
}

module.exports = AppController;
