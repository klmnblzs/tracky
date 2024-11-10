import { Component, inject, OnInit } from '@angular/core';
import { LoginService } from '../../Services/login.service';
import { Router } from '@angular/router';
import { LocalStorageService } from '@coreui/angular';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss'
})
export class LogoutComponent implements OnInit {
  loginService = inject(LoginService)
  router = inject(Router)
  localStorageService = inject(LocalStorageService)

  ngOnInit(): void {
    if(!localStorage.getItem("refreshToken")) {
      if(localStorage.getItem("token")){
          this.localStorageService.removeItem("token")
      }
      this.router.navigate(["/login"])
    }

    if(!localStorage.getItem("token")) {
      if(localStorage.getItem("refreshToken")){
          this.localStorageService.removeItem("refreshToken")
      }
      this.router.navigate(["/login"])
    }
    
    const subscription = this.loginService.logoutUser({ refreshToken: localStorage.getItem("refreshToken") }).subscribe({
      next: (res) => {
        if(localStorage.getItem("token")){
          this.localStorageService.removeItem("token")
        }
        if(localStorage.getItem("refreshToken")){
          this.localStorageService.removeItem("refreshToken")
        }
        this.router.navigate(["/login"])
      }
    })
  }
}
