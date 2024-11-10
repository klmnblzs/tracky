import { Component, inject, OnInit } from '@angular/core';
import { LoginService } from '../../Services/login.service';
import { Router } from '@angular/router';
import { LocalStorageService } from '@coreui/angular';
import { throwError } from 'rxjs';

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
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      console.log("Nincs refresh token");
      this.router.navigate(["/login"]);
      return;
    }
    
    this.loginService.logoutUser({ refreshToken }).subscribe({
      next: (res) => {
        console.log("Kijelentkezve:", res);

        this.localStorageService.removeItem("token");
        this.localStorageService.removeItem("refreshToken");

        this.router.navigate(["/login"]);
      },
      error: (err) => {
        console.error("Hiba a kijelentkezés során:", err);
      }
    });
  }
}
