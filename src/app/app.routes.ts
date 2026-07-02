import { Routes } from '@angular/router';
import { UserListComponent } from './components/users/user-list/user-list.component';
import { UserDetailComponent } from './components/users/user-detail/user-detail.component';
import { TaskListComponent } from './components/tasks/task-list/task-list.component';
import { TaskDetailComponent } from './components/tasks/task-detail/task-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: '/users', pathMatch: 'full' },
  { path: 'users', component: UserListComponent },
  { path: 'users/:id', component: UserDetailComponent },
  { path: 'tasks', component: TaskListComponent },
  { path: 'tasks/:id', component: TaskDetailComponent },
  { path: '**', redirectTo: '/users' }
];