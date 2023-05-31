const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const dbClient = require('../utils/db');

class FilesController {
  static async getShow(req, res) {
    const token = req.header('X-Token');
    const fileId = req.params.id;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const collection = dbClient.client.db().collection('users');

      const user = await collection.findOne({ token });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const file = await collection.findOne({ _id: fileId, userId: user._id });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      return res.status(200).json(file);
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getIndex(req, res) {
    const token = req.header('X-Token');
    const parentId = req.query.parentId || 0;
    const page = req.query.page || 0;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const collection = dbClient.client.db().collection('users');

      const user = await collection.findOne({ token });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const pageSize = 20;
      const skip = page * pageSize;

      const files = await collection
        .find({ parentId, userId: user._id })
        .skip(skip)
        .limit(pageSize)
        .toArray();

      return res.status(200).json(files);
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = FilesController;
