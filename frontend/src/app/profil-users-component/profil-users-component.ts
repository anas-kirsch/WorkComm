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

  dataOfUser: Friends | null = null;
  constructor(private route: ActivatedRoute, private cdr: ChangeDetectorRef) { }

  async ngOnInit() {
  this.route.paramMap.subscribe(async params => {
    this.username = params.get('username');
    if (this.username) {
      const data = await this.friendService.fetchDataByUsername(this.username);
      this.dataOfUser = data;
      console.log("tets", data)
      this.cdr.detectChanges();
    }
  });
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

  async vide() {

    this.searchValue = '';
    this.foundUsers = [];

  }










}