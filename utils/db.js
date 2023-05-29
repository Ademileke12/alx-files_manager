import { MongoClient } from 'mongodb';
import redisClient from './redis';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    const url = `mongodb://${host}:${port}/${database}`;

    this.client = new MongoClient(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    this.connection = null;

    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      this.connection = this.client.db();
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
    }
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    return this.connection.collection('users').countDocuments();
  }

  async nbFiles() {
    return this.connection.collection('files').countDocuments();
  }

  async getUserByToken(token) {
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return null;

    const user = await this.connection
      .collection('users')
      .findOne({ _id: userId });

    return user;
  }
}

const dbClient = new DBClient();
export default dbClient;

