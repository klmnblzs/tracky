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

  getExpensesByMonth(month:string, userid:string) {
    return this.requestsManager.fetch(
      `http://localhost:3000/expenses/${userid}/${month}`,
      "Error fetching expense"
    )
  }

  getExpense(month:string, year:string, userid:string) {
    return this.requestsManager.fetch(
      `http://localhost:3000/expenses/${userid}/${year}/${month}`,
      "Error fetching expense"
    )
  }

  getMonthlySum(month:string, year:string, userid:string) {
    return this.requestsManager.fetch(
      "http://localhost:3000/expenses/month/sum/" + userid + "/" + year + "/" + month,
      "Error fetching expense"
    )
  }

  getExpenseStat(userid:string, year:string) {
    return this.requestsManager.fetch(
      "http://localhost:3000/stats/" + userid + "/" + year,
      "Error fetching stats"
    )
  }

  getExpenseById(id:number, userid:string) {
    return this.requestsManager.fetch(
      "http://localhost:3000/expenses/id/" + userid + "/" + id,
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
