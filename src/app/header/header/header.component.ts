import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import * as fromApp from '../../store/app.reducer';
import * as authActions from '../../auth/store/auth.actions';
import * as recipesActions from '../../recipes/store/recipe.actions';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private userSub: Subscription;
  isAuthenticated = false;

  constructor(private store: Store<fromApp.AppState>) { }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.userSub = this.store.select('auth')
      .pipe(map(authState => {
        return authState.user;
      }))
      .subscribe(user => {
        this.isAuthenticated = !!user;
      });
  }

  onSaveData() {
    this.store.dispatch(new recipesActions.StoreRecipes());
  }

  onFetchData() {
    this.store.dispatch(new recipesActions.FetchRecipes());
  }

  onLogout() {
    this.store.dispatch(new authActions.Logout());
  }
}
