const express = require('express');
const router = express.Router();
const { shareFile, removeShare, accessByLink, getSharedWithMe } = require('../controllers/shareController');
const { protect } = require('../middleware/authMiddleware');

router.get('/shared-with-me', protect, getSharedWithMe);
router.get('/link/:token', accessByLink);
router.post('/:fileId', protect, shareFile);
router.delete('/:fileId/user/:userId', protect, removeShare);

module.exports = router;
