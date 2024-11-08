import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  httpClient = inject(HttpClient);

  private fetch(url:string, errorMessage:string) {
    return this.httpClient.get(url)
    .pipe(
      catchError((err) => throwError(() => {
        console.log(err)
        new Error(errorMessage)
      }))
    )
  }

  private post(url:string, body:Object, errorMessage:string) {
    return this.httpClient.post(url, body)
    .pipe(
      catchError((err) => throwError(() => {
        console.log(err)
        new Error(errorMessage)
      }))
    )
  }

  addNewCategory(formData:Object) {
    return this.post(
      "http://localhost:3000/categories/new",
      formData,
      "Error while adding new user"
    )
  }

  deleteCategory(formData:Object) {
    return this.post(
      "http://localhost:3000/categories/delete",
      formData,
      "Error while adding new user"
    )
  }

  getCategories() {
    return this.fetch(
      "http://localhost:3000/categories",
      "Error fetching categories"
    )
  }
  
}
