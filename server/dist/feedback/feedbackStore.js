export class FeedbackStore {
    feedbackList = [];
    constructor() {
        // Seed initial feedback for admin view
        this.feedbackList.push({
            id: 'fb-1',
            userId: 'user-1',
            userName: 'Karthik',
            userEmail: 'karthik@example.com',
            category: 'AI response quality',
            message: 'The speed and direct response quality on C++ and algorithms is impressive! Love the clean interface.',
            rating: 5,
            status: 'reviewed',
            createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        });
    }
    addFeedback(item) {
        const newFeedback = {
            id: `fb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
            ...item,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };
        this.feedbackList.unshift(newFeedback);
        return newFeedback;
    }
    getAllFeedback() {
        return [...this.feedbackList];
    }
    updateStatus(id, status) {
        const item = this.feedbackList.find((f) => f.id === id);
        if (item) {
            item.status = status;
            return item;
        }
        return null;
    }
}
export const globalFeedbackStore = new FeedbackStore();
