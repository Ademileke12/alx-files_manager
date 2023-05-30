import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import fs from 'fs';
import path from 'path';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
  static async postUpload(req, res) {
    const { name, type, parentId = 0, isPublic = false, data } = req.body;
    const userId = req.user.id;

    // Retrieve the user based on the token
    const user = await dbClient.getUserById(userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if required fields are missing
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // If parentId is set, validate it
    if (parentId !== 0) {
      const parentFile = await dbClient.getFile(parentId);
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }

      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    // Create the new file document in the DB
    const fileId = uuidv4();
    const file = {
      id: fileId,
      userId,
      name,
      type,
      isPublic,
      parentId,
      localPath: null,
    };
    await dbClient.createFile(file);

    // If type is folder, return the new file
    if (type === 'folder') {
      return res.status(201).json(file);
    }

    // Store the file locally
    const fileData = Buffer.from(data, 'base64');
    const filePath = path.join(FOLDER_PATH, fileId);
    fs.writeFileSync(filePath, fileData);

    // Update the localPath in the file document
    file.localPath = filePath;
    await dbClient.updateFile(fileId, { localPath: filePath });

    return res.status(201).json(file);
  }
}

export default FilesController;
