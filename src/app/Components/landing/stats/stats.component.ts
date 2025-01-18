import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { ExpensesService } from '../../../Services/expenses.service';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss'
})
export class StatsComponent implements OnInit {
  private userId:any = localStorage.getItem('userId')
  private expensesService = inject(ExpensesService)

  ngOnInit(): void {
    this.loadChart()
  }

  loadChart() {
    this.expensesService.getExpenseStat(this.userId).subscribe({
      next: (res:any) => {
        const labels = res.map( (item:any) => item.category );
        const values = res.map( (item:any) => item.total );

        new Chart('pieChart', {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Költések',
                data: values,
                backgroundColor: [
                  'rgb(255, 99, 132)',
                  'rgb(54, 162, 235)',
                  'rgb(255, 206, 86)',
                  'rgb(75, 192, 192)',
                  'rgb(153, 102, 255)',
                  'rgb(167, 66, 255)',
                  'rgb(255, 66, 192)',
                  'rgb(255, 249, 66)'
                ],
                hoverOffset: 4,
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
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
