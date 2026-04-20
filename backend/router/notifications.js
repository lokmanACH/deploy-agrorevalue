const express = require('express');
const router = express.Router();

const {
    getUnreadNotifications,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
} = require('../utils/notifications');

/**
 * GET /api/notifications/unread
 * Get unread notifications count for a user
 * Query: user_id
 */
router.get('/unread', async (req, res) => {
    try {
        const { user_id } = req.query;

        if (!user_id) {
            return res.status(400).json({ error: 'user_id is required' });
        }

        const notifications = await getUnreadNotifications(Number(user_id));
        res.json({
            count: notifications.length,
            notifications
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get unread notifications' });
    }
});

/**
 * GET /api/notifications
 * Get all notifications for a user with pagination
 * Query: user_id, limit (default 50), offset (default 0)
 */
router.get('/', async (req, res) => {
    try {
        const { user_id, limit = 50, offset = 0 } = req.query;

        if (!user_id) {
            return res.status(400).json({ error: 'user_id is required' });
        }

        const result = await getUserNotifications(
            Number(user_id),
            Number(limit),
            Number(offset)
        );

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get notifications' });
    }
});

/**
 * PUT /api/notifications/:id/read
 * Mark a single notification as read
 */
router.put('/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await markAsRead(Number(id));

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json({ message: 'Notification marked as read', notification });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications for a user as read
 * Body: { user_id }
 */
router.put('/read-all', async (req, res) => {
    try {
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({ error: 'user_id is required' });
        }

        await markAllAsRead(Number(user_id));
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
});

/**
 * DELETE /api/notifications/:id
 * Delete a single notification
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const success = await deleteNotification(Number(id));

        if (!success) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});

/**
 * DELETE /api/notifications
 * Delete all notifications for a user
 * Query: user_id
 */
router.delete('/', async (req, res) => {
    try {
        const { user_id } = req.query;

        if (!user_id) {
            return res.status(400).json({ error: 'user_id is required' });
        }

        await deleteAllNotifications(Number(user_id));
        res.json({ message: 'All notifications deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete all notifications' });
    }
});

module.exports = router;
