import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';

class FilesController {
  static async postUpload(req, res) {
    const token = req.header('X-Token') || '';
    const user = await dbClient.getUserByToken(token);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, type, parentId = 0, isPublic = false, data } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (parentId !== 0) {
      const parentFile = await dbClient.getFile(parentId);

      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }

      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const file = {
      userId: user._id.toString(),
      name,
      type,
      isPublic,
      parentId,
    };

    if (type === 'folder') {
      const result = await dbClient.createFile(file);
      return res.status(201).json(result);
    } else {
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      const filePath = path.join(folderPath, `${uuidv4()}`);

      fs.writeFileSync(filePath, data, 'base64');

      const result = await dbClient.createFile({ ...file, localPath: filePath });
      return res.status(201).json(result);
    }
  }
}

export default FilesController;
