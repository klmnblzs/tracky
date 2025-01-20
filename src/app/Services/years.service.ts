import { inject, Injectable } from '@angular/core';
import { RequestsService } from './requests.service';

@Injectable({
  providedIn: 'root'
})
export class YearsService {
  private requestsManager = inject(RequestsService)

  getYears(userid:string) {
    return this.requestsManager.fetch(
      "http://localhost:3000/years/" + userid,
      "Error fetching salary"
    )
  }

  addYear(formData:Object) {
    return this.requestsManager.post(
      "http://localhost:3000/years/add",
      formData,
      "Error while adding new user"
    )
  }
} 
