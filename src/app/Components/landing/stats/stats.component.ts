import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { ExpensesService } from '../../../Services/expenses.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { YearsService } from '../../../Services/years.service';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss'
})
export class StatsComponent implements OnInit {
  private userId:any = localStorage.getItem('userId')
  private expensesService = inject(ExpensesService)
  private yearsService = inject(YearsService)
  private destroyRef = inject(DestroyRef)

  chart: Chart | null = null
  currentYear:any = (new Date().getFullYear())

  yearSelector = new FormGroup({
    year: new FormControl('')
  })

  years:any;

  getYears() {
    const subscription = this.yearsService.getYears(this.userId!).subscribe({
      next: (res:any) => {
        this.years = res;
      }
    })

    this.destroyRef.onDestroy(() => subscription.unsubscribe())
  }

  ngOnInit(): void {
    this.loadChart()
    this.getYears()

    this.yearSelector.controls.year.valueChanges.subscribe((year:any) => {
      this.currentYear = year
      this.deleteChart()
      this.loadChart()
    })
  }

  deleteChart() {
    if(this.chart) {
      this.chart.destroy()
      this.chart = null
    }
  }

  ngOnDestroy() {
    this.deleteChart()
  }

  loadChart() {
    this.expensesService.getExpenseStat(this.userId, this.currentYear).subscribe({
      next: (res:any) => {
        const labels = res.map( (item:any) => item.category );
        const values = res.map( (item:any) => item.total );

        this.chart = new Chart('pieChart', {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Költések',
                data: values,
                hoverOffset: 4,
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              colors: {
                enabled: true
              },
              legend: {
                position: 'bottom',
                labels: {
                  color: 'white',
                  padding: 25,
                }
              },
            },
          },
        });
      }
    })
  }


}
