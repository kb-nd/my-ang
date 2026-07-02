export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  user_id?: number;
  user_name?: string;
  due_date?: string;
  created_at: string;
}