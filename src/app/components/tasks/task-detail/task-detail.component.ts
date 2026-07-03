import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { UserService } from '../../../services/user.service';
import { Task } from '../../../models/task.model';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss'
})
export class TaskDetailComponent implements OnInit {
  task: Task | null = null;
  isNew = false;
  users: User[] = [];
  formData = {
    title: '',
    description: '',
    status: 'pending' as 'pending' | 'in-progress' | 'completed',
    priority: 'medium' as 'low' | 'medium' | 'high',
    user_id: undefined as number | undefined,
    due_date: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    const id = this.route.snapshot.paramMap.get('id');
    if (id === 'new') {
      this.isNew = true;
    } else if (id) {
      this.loadTask(+id);
    }
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Hiba a felhasználók betöltésekor:', err)
    });
  }

  loadTask(id: number): void {
    this.taskService.getTaskById(id).subscribe({
      next: (task) => {
        if (task) {
          this.task = task;
          this.formData = {
            title: task.title,
            description: task.description || '',
            status: task.status,
            priority: task.priority,
            user_id: task.user_id,
            due_date: task.due_date || ''
          };
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Hiba a feladat betöltésekor:', err)
    });
  }

  onSubmit(): void {
    const taskData = {
      ...this.formData,
      due_date: this.formData.due_date || undefined
    };

    if (this.isNew) {
      this.taskService.addTask(taskData).subscribe({
        next: () => this.router.navigate(['/tasks']),
        error: (err) => console.error('Hiba a létrehozás során:', err)
      });
    } else if (this.task) {
      this.taskService.updateTask(this.task.id, taskData).subscribe({
        next: () => this.router.navigate(['/tasks']),
        error: (err) => console.error('Hiba a frissítés során:', err)
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/tasks']);
  }
}