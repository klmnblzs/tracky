import { Component, DestroyRef, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LoginService } from '../../Services/login.service';
import { LocalStorageService } from '@coreui/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginService = inject(LoginService)
  localStorageService = inject(LocalStorageService)
  destroyRef = inject(DestroyRef)
  router = inject(Router)

  loginForm = new FormGroup({
    username: new FormControl(''),
    password: new FormControl('')
  })

  loginError=false;
  
  onLogin() {
    if(this.loginForm.valid) {
      const subscription = this.loginService.loginUser({
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
