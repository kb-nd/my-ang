import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TaskService } from '../../../services/task.service';
import { Task } from '../../../models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatCardModule, MatChipsModule, MatSnackBarModule
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  displayedColumns = ['title', 'user', 'status', 'priority', 'deadline', 'actions'];

  private taskService = inject(TaskService);
  private cdr = inject(ChangeDetectorRef);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.cdr.detectChanges();
      },
      error: () => {
        this.snackBar.open('Hiba a feladatok betöltésekor', 'Bezár', { duration: 3000 });
      }
    });
  }

  deleteTask(task: Task): void {
    if (confirm(`Biztosan törölni szeretné "${task.title}" feladatot?`)) {
      this.taskService.deleteTask(task.id).subscribe({
        next: () => {
          this.snackBar.open('Feladat törölve', 'OK', { duration: 2000 });
          this.loadTasks();
        },
        error: () => this.snackBar.open('Hiba a törlés során', 'Bezár', { duration: 3000 })
      });
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'completed': return 'Befejezett';
      case 'in-progress': return 'Folyamatban';
      default: return 'Függőben';
    }
  }

  getPriorityLabel(priority: string): string {
    switch (priority) {
      case 'high': return 'Magas';
      case 'medium': return 'Közepes';
      default: return 'Alacsony';
    }
  }
}