import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, tap, throwError } from 'rxjs';
import { RequestsService } from './requests.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private httpClient = inject(HttpClient);
  private router = inject(Router);
  private requestsManager = inject(RequestsService)

  addNewCategory(formData:Object) {
    return this.requestsManager.post(
      "http://192.168.0.156:3000/categories/new",
      formData,
      "Error while adding new user"
    )
  }

  deleteCategory(formData:Object) {
    return this.requestsManager.post(
      "http://192.168.0.156:3000/categories/delete",
      formData,
      "Error while adding new user"
    )
  }

  getCategories(userId:string) {
    return this.requestsManager.fetch(
      "http://192.168.0.156:3000/categories/" + userId,
      "Error fetching categories"
    )
  }
  
}
