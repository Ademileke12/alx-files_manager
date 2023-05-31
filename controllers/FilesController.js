const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const dbClient = require('../utils/db');

class FilesController {
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

      const file = await collection.findOne({ _id: fileId, userId: user._id });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      await collection.updateOne({ _id: file._id }, { $set: { isPublic: true } });

      const updatedFile = await collection.findOne({ _id: file._id });

      return res.status(200).json(updatedFile);
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

      const file = await collection.findOne({ _id: fileId, userId: user._id });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      await collection.updateOne({ _id: file._id }, { $set: { isPublic: false } });

      const updatedFile = await collection.findOne({ _id: file._id });

      return res.status(200).json(updatedFile);
    } catch (error) {
      console.error('Error:', error);

module.exports = FilesController;
