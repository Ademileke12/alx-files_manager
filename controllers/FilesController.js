const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const dbClient = require('../utils/db');

class FilesController {
  static async postUpload(req, res) {
    const token = req.header('X-Token');
    const { name, type, parentId, isPublic, data } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    try {
      const collection = dbClient.client.db().collection('users');

      const user = await collection.findOne({ token });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (parentId) {
        const parentFile = await collection.findOne({ _id: parentId });

        if (!parentFile) {
          return res.status(400).json({ error: 'Parent not found' });
        }

        if (parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      let localPath = '';

      if (type === 'file' || type === 'image') {
        const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';

        localPath = `${folderPath}/${uuidv4()}`;

        // Save the file locally
        const fileBuffer = Buffer.from(data, 'base64');
        fs.writeFileSync(localPath, fileBuffer);
      }

      const fileData = {
        userId: user._id,
        name,
        type,
        isPublic: isPublic || false,
        parentId: parentId || 0,
        localPath,
      };

      const result = await collection.insertOne(fileData);
      const createdFile = result.ops[0];

      return res.status(201).json(createdFile);
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

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

      return res.json(file);
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getIndex(req, res) {
    const token = req.header('X-Token');
    const parentId = req.query.parentId || 0;
    const page = req.query.page || 0;
    const limit = 20;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const collection = dbClient.client.db().collection('users');

      const user = await collection.findOne({ token });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const pipeline = [
        { $match: { userId: user._id, parentId } },
        { $skip: page * limit },
        { $limit: limit },
      ];

      const files = await collection.aggregate(pipeline).toArray();

      return res.json(files);
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async putPublish(req, res) {
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

      const filter = { _id: fileId, userId: user._id };
      const update = { $set: { isPublic: true } };

      const result = await collection.updateOne(filter, update);

      if (result.modifiedCount === 0) {
        return res.status(404).json({ error: 'Not found' });
      }

      const updatedFile = await collection.findOne({ _id: fileId });

      return res.json(updatedFile);
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async putUnpublish(req, res) {
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

      const filter = { _id: fileId, userId: user._id };
      const update = { $set: { isPublic: false } };

      const result = await collection.updateOne(filter, update);

      if (result.modifiedCount === 0) {
        return res.status(404).json({ error: 'Not found' });
      }

      const updatedFile = await collection.findOne({ _id: fileId });

      return res.json(updatedFile);
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = FilesController;
