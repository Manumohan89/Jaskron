import path from 'path';
import fs from 'fs';
import { Resource } from '../models/Resource.js';

export async function getResources(req, res) {
  try {
    const { category, search } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (search) filter.title = { $regex: search, $options: 'i' };
    const resources = await Resource.find(filter).sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function uploadResource(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { title, description, category, isPublic } = req.body;
    const resource = await Resource.create({
      title: title || req.file.originalname,
      description: description || '',
      category: category || 'Other',
      fileName: req.file.originalname,
      filePath: req.file.filename,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: req.user.id,
      isPublic: isPublic !== 'false'
    });
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteResource(req, res) {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    const filePath = path.join(process.cwd(), 'uploads', 'resources', resource.filePath);
    fs.unlink(filePath, () => {});
    res.json({ message: 'Resource deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function downloadResource(req, res) {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    if (!resource.isPublic && !req.user) {
      return res.status(401).json({ message: 'Login required to download this resource' });
    }
    resource.downloadCount += 1;
    await resource.save();
    const filePath = path.join(process.cwd(), 'uploads', 'resources', resource.filePath);
    res.download(filePath, resource.fileName);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
