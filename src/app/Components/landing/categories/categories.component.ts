import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ExpensesService } from '../../../Services/expenses.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../../Services/category.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent {
  //API

  expensesService = inject(ExpensesService);
  categoryService = inject(CategoryService);
  destroyRef = inject(DestroyRef);
  
  categories:any = null;

  ngOnInit(): void {
    const subscription = this.categoryService.getCategories(localStorage.getItem("userId")!).subscribe({
      next: (res) => {
        this.categories=res
      }
    })
  }

  loadCategories() {
    const subscription = this.categoryService.getCategories(localStorage.getItem("userId")!).subscribe({
      next: (res) => {
        this.categories=res
      }
    })


    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe()
    })
  }

  // DIALOG
  openAddCategoryDialog() {
    const dialog = document.getElementById("addCategoryDialog") as HTMLElement
    
    dialog.style.visibility = "unset"
  }

  hideAddCategoryDialog() {
    const dialog = document.getElementById("addCategoryDialog") as HTMLElement
    
    dialog.style.visibility = "hidden"
  }

  openDeleteCategoryDialog() {
    const dialog = document.getElementById("removeCategoryDialog") as HTMLElement
    
    dialog.style.visibility = "unset"
  }

  hideDeleteCategoryDialog() {
    const dialog = document.getElementById("removeCategoryDialog") as HTMLElement
    
    dialog.style.visibility = "hidden"
  }

  // FORM
  addCategoryForm = new FormGroup({
    category: new FormControl('', { validators: [ Validators.required ] })
  })

  onSubmitAdd() {
    const subscription = this.categoryService.addNewCategory(
      {
        category: this.addCategoryForm.value.category,
        userId: localStorage.getItem("userId")
      }
    ).subscribe({
      next: (res) => {
        this.addCategoryForm.reset()
        this.loadCategories()
        this.hideAddCategoryDialog()
      }
    })
    
    this.destroyRef.onDestroy( () => subscription.unsubscribe() )
  }

  deleteCategoryForm = new FormGroup({
    category: new FormControl(''),
  })

  onSubmitDelete() {


    const subscription = this.categoryService.deleteCategory(
      {
        category: this.deleteCategoryForm.value.category,
        userId: localStorage.getItem("userId")
      }
    ).subscribe({
      next: (res) => {
        this.loadCategories()
        this.hideDeleteCategoryDialog()
      }
    })
    
    this.destroyRef.onDestroy( () => subscription.unsubscribe() )
  }

}
