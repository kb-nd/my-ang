import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
  users: User[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    console.log('Loading users...');
    this.userService.getUsers().subscribe({
      next: (users) => {
        console.log('Users received:', users);
        this.users = users;
      },
      error: (err) => {
        console.error('Hiba a felhasználók betöltésekor:', err);
        console.error('Error details:', JSON.stringify(err));
      }
    });
  }

  deleteUser(id: number): void {
    if (confirm('Biztosan törölni szeretné ezt a felhasználót?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => this.loadUsers(),
        error: (err) => console.error('Hiba a törlés során:', err)
      });
    }
  }
}