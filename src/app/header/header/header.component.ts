import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataStorageService } from 'src/app/shared/data-storage.service';
import { AuthService } from 'src/app/auth/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private userSub: Subscription;
  isAuthenticated = false;

  constructor(private dataStorageService: DataStorageService,
    private authService: AuthService) { }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }

  onSaveData() {
    this.dataStorageService.storeRecipes();
  }

  onFetchData() {
    this.dataStorageService.fetchRecipes().subscribe();
  }

  onLogout() {
    this.authService.logout();
  }
}
