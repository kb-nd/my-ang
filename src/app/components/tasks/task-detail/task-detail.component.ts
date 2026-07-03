import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TaskService } from '../../../services/task.service';
import { UserService } from '../../../services/user.service';
import { Task } from '../../../models/task.model';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule,
    MatProgressSpinnerModule, MatSnackBarModule
  ],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss'
})
export class TaskDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private taskService = inject(TaskService);
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  task: Task | null = null;
  isNew = false;
  isLoading = false;
  users: User[] = [];

  taskForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    status: ['pending' as 'pending' | 'in-progress' | 'completed', Validators.required],
    priority: ['medium' as 'low' | 'medium' | 'high', Validators.required],
    user_id: [] as unknown as number,
    due_date: ['']
  });

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
      }
    });
  }

  loadTask(id: number): void {
    this.taskService.getTaskById(id).subscribe({
      next: (task) => {
        if (task) {
          this.task = task;
          this.taskForm.patchValue({
            title: task.title,
            description: task.description || '',
            status: task.status,
            priority: task.priority,
            user_id: task.user_id,
            due_date: task.due_date || ''
          });
          this.cdr.detectChanges();
        }
      },
      error: () => this.snackBar.open('Hiba a feladat betöltésekor', 'Bezár', { duration: 3000 })
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) return;

    this.isLoading = true;
    const data = {
      ...this.taskForm.value,
      due_date: this.taskForm.value.due_date || undefined
    };

    const request$ = this.isNew
      ? this.taskService.addTask(data as any)
      : this.taskService.updateTask(this.task!.id, data as any);

    request$.subscribe({
      next: () => {
        this.snackBar.open(this.isNew ? 'Feladat létrehozva' : 'Feladat frissítve', 'OK', { duration: 2000 });
        this.router.navigate(['/tasks']);
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open(err.error?.error || 'Hiba a mentés során', 'Bezár', { duration: 3000 });
        this.cdr.detectChanges();
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/tasks']);
  }
}