import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { LocalStorageService } from '@coreui/angular';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  AuthService = inject(AuthService)
  localStorageService = inject(LocalStorageService)
  destroyRef = inject(DestroyRef)
  router = inject(Router)

  loginForm = new FormGroup({
    username: new FormControl(''),
    password: new FormControl('')
  })

  loginError=false;

  ngOnInit(): void {
    if(localStorage.getItem("token") && localStorage.getItem("refreshToken")) {
      this.router.navigate(["/landing"])
    }
  }
  
  onLogin() {
    if(this.loginForm.valid) {
      const subscription = this.AuthService.loginUser({
        username: this.loginForm.value.username,
        password: this.loginForm.value.password,
      }).subscribe({
        next: (res: any) => {
          this.localStorageService.setItem("token", res.token)
          this.localStorageService.setItem("refreshToken", res.refreshToken)
          setTimeout(() => {
            this.router.navigate(["/landing"])
          })
        }, error: (err) => {
          this.loginError=true
        }
      })
      this.destroyRef.onDestroy(() => subscription.unsubscribe())
    }
  }
}
