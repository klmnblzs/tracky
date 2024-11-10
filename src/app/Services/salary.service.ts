import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, switchMap, tap, throwError } from 'rxjs';
import { RequestsService } from './requests.service';

@Injectable({
  providedIn: 'root'
})
export class SalaryService {
  private httpClient = inject(HttpClient)
  private requestsManager = inject(RequestsService)

  getSalaryByMonth(month:string) {
    return this.requestsManager.fetch(
      "http://localhost:3000/salary/get/" + month,
      "Error fetching salary"
    )
  }

  addSalary(formData:Object) {
    return this.requestsManager.post(
      "http://localhost:3000/salary/new",
      formData,
      "Error while adding salary"
    )
  }

  editSalary(formData:Object) {
    return this.requestsManager.post(
      "http://localhost:3000/salary/edit",
      formData,
      "Error while editing salary"
    )
  }
}
