import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { LocalStorageService } from '@coreui/angular';
import { Router, RouterLink } from '@angular/router';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  AuthService = inject(AuthService)
  localStorageService = inject(LocalStorageService)
  destroyRef = inject(DestroyRef)
  router = inject(Router)

  registerForm = new FormGroup({
    username: new FormControl('', { validators: Validators.required }),
    password: new FormControl('', { validators: Validators.required })
  })

  registerError=false;
  errorText:string=""

  ngOnInit(): void {
    if(localStorage.getItem("token") && localStorage.getItem("refreshToken")) {
      this.router.navigate(["/landing"])
    }
  }
  
  onRegister() {
    if (this.registerForm.valid) {
      this.AuthService.checkUsername(this.registerForm.value.username!).subscribe({
        next: (res: any) => {
          const subscription = this.AuthService.registerUser({
            username: this.registerForm.value.username,
            password: this.registerForm.value.password,
          }).subscribe({
            next: (res: any) => {
              setTimeout(() => {
                this.router.navigate(["/login"]);
              });
            },
            error: (err) => {
              this.registerError = true;
              this.errorText = 'Tölts ki minden mezőt!';
            }
          });
          this.destroyRef.onDestroy(() => subscription.unsubscribe());
        },
        error: (err) => {
          this.registerError = true;
          this.errorText = 'Felhasználónév már létezik!';
        }
      });
    } else {
      this.registerError = true;
      this.errorText = "Tölts ki minden mezőt!!";
    }
  }
}
