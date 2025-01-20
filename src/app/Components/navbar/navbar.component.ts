import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { YearsService } from '../../Services/years.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  private router = inject(Router)
  private yearsService = inject(YearsService)
  private destroyRef = inject(DestroyRef)

  userId = localStorage.getItem("userId")
  currentYear:any = localStorage.getItem('currentYear') ? localStorage.getItem("currentYear") : (new Date().getFullYear())

  months: string[] = ["Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"]
  years:any;
  errorMsg:any = null;

  removeEkezet(input: string): string {
    const ekezetek: { [key: string]: string } = {
        á: 'a', é: 'e', í: 'i', ó: 'o', ö: 'o', ő: 'o', ú: 'u', ü: 'u', ű: 'u',
        Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ö: 'O', Ő: 'O', Ú: 'U', Ü: 'U', Ű: 'U'
    };

    return input.split('').map(char => ekezetek[char] || char).join('');
  }

  yearSelector = new FormGroup({
    year: new FormControl('')
  })

  addYearForm = new FormGroup({
    year: new FormControl(0, { validators: [ Validators.required ] })
  })

  showAddYearDialog = false;
  isAddYearDialogShown() {
      this.showAddYearDialog = !this.showAddYearDialog
  }

  onAddYear() {
    if (this.addYearForm.invalid) {
      this.errorMsg = "Adj meg egy évet!";
      return
  }

    const subscription = this.yearsService.addYear({
      year: this.addYearForm.value.year,
      userId: this.userId
    }).subscribe({
      next: (res) => {
        this.addYearForm.reset()
        this.getYears()
        this.isAddYearDialogShown()
        this.errorMsg = "";
      },
      error: (err) => {
        this.errorMsg = "Töltsd ki rendesen."
      }
    })
  }

  getYears() {
    const subscription = this.yearsService.getYears(this.userId!).subscribe({
      next: (res:any) => {
        this.years = res;
      }
    })

    this.destroyRef.onDestroy(() => subscription.unsubscribe())
  }

  ngOnInit(): void {
    this.getYears();

    let select = document.getElementById("yearSelector") as HTMLSelectElement
    select.selectedIndex = 0;
    
    this.yearSelector.controls.year.valueChanges.subscribe((year:any) => {
      if(year === "new") {
        console.log("yessir")
        let select = document.getElementById("yearSelector") as HTMLSelectElement
        select.selectedIndex = 0;
        
        this.isAddYearDialogShown()
        
        return;
      }
      
      localStorage.setItem("currentYear", year)
      this.currentYear = localStorage.getItem('currentYear')
      this.router.navigate(["/dashboard/" + this.userId + "/" + this.currentYear + "/" + "januar"])
    })
  }
}
