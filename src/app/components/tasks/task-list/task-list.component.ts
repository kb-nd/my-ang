import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { Task } from '../../../models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (tasks) => this.tasks = tasks,
      error: (err) => console.error('Hiba a feladatok betöltésekor:', err)
    });
  }

  deleteTask(id: number): void {
    if (confirm('Biztosan törölni szeretné ezt a feladatot?')) {
      this.taskService.deleteTask(id).subscribe({
        next: () => this.loadTasks(),
        error: (err) => console.error('Hiba a törlés során:', err)
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'in-progress': return 'status-in-progress';
      default: return 'status-pending';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'completed': return 'Befejezett';
      case 'in-progress': return 'Folyamatban';
      default: return 'Függőben';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      default: return 'priority-low';
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