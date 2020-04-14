import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService, AuthResponseData } from './auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  isLoginMode = true;
  isLoading = false;
  error: string = null;
  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(authFrom: NgForm) {
    if (!authFrom.valid) {
      return;
    }

    const email = authFrom.value.email;
    const password = authFrom.value.password;

    let authObs: Observable<AuthResponseData>;
    this.isLoading = true;
    this.error = '';
    if (this.isLoginMode) {
      authObs = this.authService.login(email, password);
    } else {
      authObs = this.authService.signup(email, password);
    }

    authObs.subscribe(result => {
      console.log(result);
      this.isLoading = false;
    }, errorMessage => {
      console.log(errorMessage);
      this.error = errorMessage;     
      this.isLoading = false;
    });

    authFrom.reset(); 
  }
}
