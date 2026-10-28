const express = require('express');
const router = express.Router();
const { uploadFile, getFiles, getFileById, deleteFile, downloadFile } = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/upload', protect, upload.single('file'), uploadFile);
router.get('/', protect, getFiles);
router.get('/:id', protect, getFileById);
router.delete('/:id', protect, deleteFile);
router.get('/:id/download', protect, downloadFile);

module.exports = router;
