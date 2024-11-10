import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ExpensesService } from '../../Services/expenses.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CategoryService } from '../../Services/category.service';
import { CategoriesComponent } from "./categories/categories.component";
import { NavbarComponent } from "../navbar/navbar.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [ReactiveFormsModule, CategoriesComponent, NavbarComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit {
  private router = inject(Router)
  ngOnInit(): void {
    const token = localStorage.getItem("token")

    if(!token) {
      this.router.navigate(["/login"])
    }
  }
} 
