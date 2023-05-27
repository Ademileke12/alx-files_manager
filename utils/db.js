const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    const url = `mongodb://${host}:${port}/${database}`;

    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.db = null;

    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db();
      console.log('Database connected');
    } catch (error) {
      console.error('Error connecting to database:', error);
    }
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    try {
      const count = await this.db.collection('users').countDocuments();
      return count;
    } catch (error) {
      console.error('Error retrieving user count:', error);
      return 0;
    }
  }

  async nbFiles() {
    try {
      const count = await this.db.collection('files').countDocuments();
      return count;
    } catch (error) {
      console.error('Error retrieving file count:', error);
      return 0;
    }
  }

  async createUser(email, password) {
    try {
      const user = { _id: new ObjectId(), email, password };
      const result = await this.db.collection('users').insertOne(user);
      return result.ops[0];
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async getUserByEmail(email) {
    try {
      const user = await this.db.collection('users').findOne({ email });
      return user;
    } catch (error) {
      console.error('Error retrieving user by email:', error);
      return null;
    }
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
