import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FriendsService } from '../service/friends/friends-service';
import { CommonModule } from '@angular/common';
import { Friends } from '../interfaces/user';

@Component({
  selector: 'app-profil-users-component',
  imports: [CommonModule],
  templateUrl: './profil-users-component.html',
  styleUrl: './profil-users-component.css'
})
export class ProfilUsersComponent implements OnInit {

  username: string | null = null;
  friendService = inject(FriendsService);
  foundUsers: Friends[] = [];
  searchValue: string = '';

  constructor(private route: ActivatedRoute, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.username = this.route.snapshot.paramMap.get('username');
    console.log(this.username);
  }

  async onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchValue = value;
    if (value != "") {
      const data = await this.friendService.fetchInputSearch(value);
      this.foundUsers = data.users;
      this.cdr.detectChanges();
    } else {
      this.foundUsers = [];
      this.cdr.detectChanges();
    }
  }
}