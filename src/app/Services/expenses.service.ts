import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, switchMap, tap, throwError } from 'rxjs';
import { RequestsService } from './requests.service';

@Injectable({
  providedIn: 'root'
})
export class ExpensesService {
  private httpClient = inject(HttpClient)
  private requestsManager = inject(RequestsService)

  getExpensesByMonth(month:string) {
    return this.requestsManager.fetch(
      "http://localhost:3000/expenses/month/" + month,
      "Error fetching expense"
    )
  }

  getMonthlySum(month:string) {
    return this.requestsManager.fetch(
      "http://localhost:3000/expenses/month/sum/" + month,
      "Error fetching expense"
    )
  }

  getExpenseById(id:number) {
    return this.requestsManager.fetch(
      "http://localhost:3000/expenses/id/" + id,
      "Error fetching expense"
    )
  }

  addNewExpense(formData:Object) {
    return this.requestsManager.post(
      "http://localhost:3000/expenses/new",
      formData,
      "Error while adding new user"
    )
  }

  editExpense(formData:Object) {
    return this.requestsManager.post(
      "http://localhost:3000/expenses/edit",
      formData,
      "Error while adding new user"
    )
  }

  deleteExpense(formData:Object) {
    return this.requestsManager.post(
      "http://localhost:3000/expenses/delete",
      formData,
      "Error while adding new user"
    )
  }
}
