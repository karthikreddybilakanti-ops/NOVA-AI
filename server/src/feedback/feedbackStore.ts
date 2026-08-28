export interface FeedbackItem {
  id: string;
  userId?: string;
  userEmail: string;
  userName?: string;
  category: 'Bug' | 'AI response quality' | 'Attachment problem' | 'Voice problem' | 'Account problem' | 'Other';
  message: string;
  rating: number; // 1-5
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

export class FeedbackStore {
  private feedbackList: FeedbackItem[] = [];

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

  public addFeedback(item: Omit<FeedbackItem, 'id' | 'createdAt' | 'status'>): FeedbackItem {
    const newFeedback: FeedbackItem = {
      id: `fb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      ...item,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.feedbackList.unshift(newFeedback);
    return newFeedback;
  }

  public getAllFeedback(): FeedbackItem[] {
    return [...this.feedbackList];
  }

  public updateStatus(id: string, status: 'pending' | 'reviewed' | 'resolved'): FeedbackItem | null {
    const item = this.feedbackList.find((f) => f.id === id);
    if (item) {
      item.status = status;
      return item;
    }
    return null;
  }
}

export const globalFeedbackStore = new FeedbackStore();
