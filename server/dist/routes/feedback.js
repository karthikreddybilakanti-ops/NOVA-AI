import { Router } from 'express';
import { globalFeedbackStore } from '../feedback/feedbackStore.js';
import { globalAuthStore } from '../auth/authStore.js';
export const feedbackRouter = Router();
// Middleware to verify admin permissions
const requireAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized. Admin authorization required.' });
        return;
    }
    const token = authHeader.split(' ')[1];
    const user = globalAuthStore.getUserByToken(token);
    if (!user || user.role !== 'admin') {
        res.status(403).json({ error: 'Access forbidden. Administrator privileges required.' });
        return;
    }
    next();
};
// 1. Submit Feedback (User Facing)
feedbackRouter.post('/', (req, res) => {
    try {
        const { category, message, rating, userEmail, userName, userId } = req.body;
        if (!message || !message.trim()) {
            res.status(400).json({ error: 'Feedback message is required' });
            return;
        }
        const item = globalFeedbackStore.addFeedback({
            category: category || 'Other',
            message: message.trim(),
            rating: Number(rating) || 5,
            userEmail: userEmail || 'anonymous@user.com',
            userName: userName || 'Anonymous User',
            userId,
        });
        res.status(201).json({ success: true, feedback: item });
    }
    catch (err) {
        res.status(500).json({ error: err.message || 'Failed to submit feedback' });
    }
});
// 2. Get All Feedback (Admin Only)
feedbackRouter.get('/admin', requireAdmin, (_req, res) => {
    const feedback = globalFeedbackStore.getAllFeedback();
    res.json({ feedback });
});
// 3. Update Feedback Status (Admin Only)
feedbackRouter.patch('/admin/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
    }
    const updated = globalFeedbackStore.updateStatus(id, status);
    if (!updated) {
        res.status(404).json({ error: 'Feedback record not found' });
        return;
    }
    res.json({ success: true, feedback: updated });
});
