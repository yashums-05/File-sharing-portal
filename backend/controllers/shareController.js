const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const User = require('../models/User');

// @desc    Share a file with user(s) by email or generate public link
// @route   POST /api/share/:fileId
// @access  Private
const shareFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to share this file' });
    }

    const { emails, makePublic } = req.body;

    if (makePublic !== undefined) {
      file.isPublic = makePublic;
    }

    if (emails && Array.isArray(emails) && emails.length > 0) {
      const users = await User.find({ email: { $in: emails } });
      const notFound = emails.filter(e => !users.find(u => u.email === e));

      if (notFound.length > 0) {
        return res.status(404).json({
          success: false,
          message: `Users not found: ${notFound.join(', ')}`,
        });
      }

      const userIds = users.map(u => u._id);
      userIds.forEach(id => {
        const alreadyShared = file.sharedWith.some(s => s.toString() === id.toString());
        if (!alreadyShared) {
          file.sharedWith.push(id);
        }
      });
    }

    await file.save();
    await file.populate('sharedWith', 'username email');

    const shareUrl = `http://localhost:5000/api/share/link/${file.shareLink}`;

    res.json({
      success: true,
      message: 'File shared successfully',
      data: {
        shareLink: file.isPublic ? shareUrl : null,
        sharedWith: file.sharedWith,
        isPublic: file.isPublic,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove a user from sharedWith
// @route   DELETE /api/share/:fileId/user/:userId
// @access  Private
const removeShare = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    file.sharedWith = file.sharedWith.filter(
      id => id.toString() !== req.params.userId
    );

    await file.save();
    res.json({ success: true, message: 'Access removed', data: file });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Access & download file via public share link
// @route   GET /api/share/link/:token
// @access  Public
const accessByLink = async (req, res) => {
  try {
    const file = await File.findOne({ shareLink: req.params.token });

    if (!file) {
      return res.status(404).json({ success: false, message: 'Invalid share link' });
    }

    if (!file.isPublic) {
      return res.status(403).json({ success: false, message: 'This file is not publicly shared' });
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

// @desc    Get files shared with the current user
// @route   GET /api/share/shared-with-me
// @access  Private
const getSharedWithMe = async (req, res) => {
  try {
    const { q } = req.query;
    const query = { sharedWith: req.user._id };

    if (q) {
      query.originalName = { $regex: q, $options: 'i' };
    }

    const files = await File.find(query)
      .populate('owner', 'username email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: files });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { shareFile, removeShare, accessByLink, getSharedWithMe };
