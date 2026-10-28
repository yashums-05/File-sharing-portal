const path = require('path');
const fs = require('fs');
const File = require('../models/File');

// @desc    Upload a file
// @route   POST /api/files/upload
// @access  Private
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const file = await File.create({
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      owner: req.user._id,
    });

    res.status(201).json({ success: true, message: 'File uploaded successfully', data: file });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all files for current user (with optional search)
// @route   GET /api/files?q=search_term
// @access  Private
const getFiles = async (req, res) => {
  try {
    const { q } = req.query;
    const query = { owner: req.user._id };

    if (q) {
      query.originalName = { $regex: q, $options: 'i' };
    }

    const files = await File.find(query)
      .populate('sharedWith', 'username email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: files });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single file by ID
// @route   GET /api/files/:id
// @access  Private
const getFileById = async (req, res) => {
  try {
    const file = await File.findById(req.params.id)
      .populate('owner', 'username email')
      .populate('sharedWith', 'username email');

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Check access
    const isOwner = file.owner._id.toString() === req.user._id.toString();
    const isShared = file.sharedWith.some(u => u._id.toString() === req.user._id.toString());

    if (!isOwner && !isShared && !file.isPublic) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: file });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a file
// @route   DELETE /api/files/:id
// @access  Private
const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this file' });
    }

    // Remove file from disk
    const filePath = path.join(__dirname, '../uploads', file.storedName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await file.deleteOne();

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Download a file
// @route   GET /api/files/:id/download
// @access  Private or via share link
const downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Check access: owner, sharedWith, or public
    const isOwner = file.owner.toString() === req.user._id.toString();
    const isShared = file.sharedWith.some(u => u.toString() === req.user._id.toString());

    if (!isOwner && !isShared && !file.isPublic) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const filePath = path.join(__dirname, '../uploads', file.storedName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on disk' });
    }

    res.download(filePath, file.originalName);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { uploadFile, getFiles, getFileById, deleteFile, downloadFile };
