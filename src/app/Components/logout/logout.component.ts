import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../Services/auth.service';
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
  AuthService = inject(AuthService)
  router = inject(Router)
  localStorageService = inject(LocalStorageService)

  ngOnInit(): void {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      console.log("Nincs refresh token");
      this.router.navigate(["/login"]);
      return;
    }

    this.AuthService.logoutUser({ refreshToken }).subscribe({
      next: (res) => {
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
