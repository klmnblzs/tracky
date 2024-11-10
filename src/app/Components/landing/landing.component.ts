import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ExpensesService } from '../../Services/expenses.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CategoryService } from '../../Services/category.service';
import { CategoriesComponent } from "./categories/categories.component";
import { NavbarComponent } from "../navbar/navbar.component";
import { Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [ReactiveFormsModule, CategoriesComponent, NavbarComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit {
  private router = inject(Router)
  private AuthService = inject(AuthService)

  username:string="";

  ngOnInit(): void {
    const token = localStorage.getItem("token")
    if(!token) {
      this.router.navigate(["/login"])
    }
    const userData = this.AuthService.getUserDataFromToken()
    this.username=userData.username
  }

  logOut() {
    this.router.navigate(["/logout"])
  }
} 
