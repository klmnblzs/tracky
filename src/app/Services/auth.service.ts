import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, tap, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private httpClient = inject(HttpClient)
  private router = inject(Router)

  private post(url:string, body:Object, errorMessage:string) {
    return this.httpClient.post(url, body)
    .pipe(
      catchError((err) => throwError(() => {
        console.log(err)
        new Error(errorMessage)
      }))
    )
  }

  loginUser(formData:Object) {
    return this.post(
      "http://localhost:3000/auth/login",
      formData,
      "Error while logging in"
    )
  }
  registerUser(formData:Object) {
    return this.post(
      "http://localhost:3000/auth/register",
      formData,
      "Error while registering"
    )
  }

  private logOutManager(url: string, body: Object, errorMessage: string) {
    const token = localStorage.getItem("token")?.replace(/"/g, "")
  
    if (!token) {
      return throwError(() => new Error("Token not found"));
    }
  
    let headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    return this.httpClient.post(url, body, { headers: headers }).pipe(
      catchError((err) => {
        return throwError(() => new Error(err));
      })
    );
  }

  logoutUser(body:Object) {
    return this.logOutManager(
      "http://localhost:3000/auth/logout",
      body,
      "Error while logging out"
    )
  }

  getUserDataFromToken() {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    try {
      const decodedToken = jwtDecode<any>(token);
      return decodedToken;
    } catch (err) {
      return err;
    }
  }

  checkUsername(username: string) {
    return this.httpClient.post('http://localhost:3000/auth/check-duplicate', { username });
  }
}
