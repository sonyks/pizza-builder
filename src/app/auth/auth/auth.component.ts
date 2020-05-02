import { Component, OnInit, ComponentFactoryResolver, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AlertComponent } from 'src/app/shared/alert/alert.component';
import { PlaceholderDirective } from 'src/app/shared/placeholder/placeholder.directive';
import * as fromApp from '../../store/app.reducer';
import { Store } from '@ngrx/store';
import * as fromAuth from '../store/auth.actions';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit, OnDestroy {

  isLoginMode = true;
  isLoading = false;
  error: string = null;
  private closeSub: Subscription;
  private storeSub: Subscription;
  @ViewChild(PlaceholderDirective) alertHost: PlaceholderDirective;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private store: Store<fromApp.AppState>) { }

  ngOnDestroy(): void {
    if (this.closeSub) {
      this.closeSub.unsubscribe();
    }

    if (this.storeSub) {
      this.storeSub.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.storeSub = this.store.select('auth').subscribe(authState => {
      this.isLoading = authState.loading;
      this.error = authState.authError;
      if (this.error) {
        this.showErrorAlert(this.error);
      }
    });
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onHandleError() {
    this.store.dispatch(new fromAuth.ClearError());
  }

  private showErrorAlert(error: string) {
    const alertComponentFactory = this.componentFactoryResolver.resolveComponentFactory(AlertComponent);
    const hostViewContainerRef = this.alertHost.viewContainerRef;
    hostViewContainerRef.clear();

    const componentRef = hostViewContainerRef.createComponent(alertComponentFactory);
    componentRef.instance.message = error;
    this.closeSub = componentRef.instance.closeAction.subscribe(() => {
      this.closeSub.unsubscribe();
      hostViewContainerRef.clear();
    });
  }

  onSubmit(authFrom: NgForm) {
    if (!authFrom.valid) {
      return;
    }

    const email = authFrom.value.email;
    const password = authFrom.value.password;

    if (this.isLoginMode) {
      this.store.dispatch(new fromAuth.LoginStart({email, password}));
    } else {
      this.store.dispatch(new fromAuth.SignupStart({email, password}));
    }

    authFrom.reset();
  }
}
