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

      const userId = user._id.toString();

      if (parentId) {
        const parentFile = await collection.findOne({ _id: parentId });

        if (!parentFile) {
          return res.status(400).json({ error: 'Parent not found' });
        }

        if (parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      const file = {
        userId,
        name,
        type,
        parentId: parentId || 0,
        isPublic: isPublic || false,
      };

      if (type === 'folder') {
        const result = await collection.insertOne(file);
        const newFile = result.ops[0];
        return res.status(201).json(newFile);
      } else {
        const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
        const filePath = `${folderPath}/${uuidv4()}`;

        fs.writeFileSync(filePath, Buffer.from(data, 'base64'));

        file.localPath = filePath;

        const result = await collection.insertOne(file);
        const newFile = result.ops[0];
        return res.status(201).json(newFile);
      }
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = FilesController;
