import { Component, DestroyRef, inject, OnInit, TemplateRef } from '@angular/core';
import { ModalModule } from '@coreui/angular';
import { ExpensesService } from '../../Services/expenses.service';
import { DecimalPipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../Services/category.service';
import { SalaryService } from '../../Services/salary.service';
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [ModalModule, DecimalPipe, ReactiveFormsModule, NavbarComponent],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
    months: string[] = ["Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November"]

    formatMonth(month: string): string {
        const monthMap: { [key: string]: string } = {
            'januar': 'Január',
            'februar': 'Február',
            'marcius': 'Március',
            'aprilis': 'Április',
            'majus': 'Május',
            'junius': 'Június',
            'julius': 'Július',
            'augusztus': 'Augusztus',
            'szeptember': 'Szeptember',
            'oktober': 'Október',
            'november': 'November',
            'december': 'December'
        };
        return monthMap[month] || "undefined";
    }

    removeEkezet(input: string): string {
        const ekezetek: { [key: string]: string } = {
            á: 'a', é: 'e', í: 'i', ó: 'o', ö: 'o', ő: 'o', ú: 'u', ü: 'u', ű: 'u',
            Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ö: 'O', Ő: 'O', Ú: 'U', Ü: 'U', Ű: 'U'
        };

        return input.split('').map(char => ekezetek[char] || char).join('');
    }

    toLower(month: string) {
        return (this.removeEkezet(month.toLocaleLowerCase()))
    }

    // API

    private expensesService = inject(ExpensesService);
    private categoryService = inject(CategoryService);
    private salaryService = inject(SalaryService);

    private destroyRef = inject(DestroyRef);
    private activatedRoute = inject(ActivatedRoute);
    private router = inject(Router);

    month: string = "";
    userid: string = "";
    currentYear: any = null;
    categories: any = null;
    expenses: any = null;
    expenseSum: any = null;
    salary: any = 0;
    savings: any = 0;

    submitErr = false

    loadExpenses() {
        const subscription = this.expensesService.getExpense(this.month, this.currentYear, localStorage.getItem("userId")!).subscribe({
            next: (res: any) => {
                if (res.status !== 500) {
                    this.expenses = res
                }
            }
        })

        const calculateSum = this.expensesService.getMonthlySum(this.month, this.currentYear, localStorage.getItem("userId")!).subscribe({
            next: (res) => {
                this.expenseSum = res

                if (this.expenseSum !== null && this.expenses !== null && this.salary !== null) {
                    this.calculateSavings()
                }
            }
        })

        this.destroyRef.onDestroy(() => {
            subscription.unsubscribe()
            calculateSum.unsubscribe()
        })
    }

    ngOnInit(): void {
        const token = localStorage.getItem("token")

        this.activatedRoute.paramMap.subscribe(params => {
            if (params.get("userid") != localStorage.getItem("userId")) {
                this.router.navigate([`/landing`])
            }
        })

        if (!token) {
            this.router.navigate(["/login"])
        }

        const subscription = this.categoryService.getCategories(localStorage.getItem("userId")!).subscribe({
            next: (res) => {
                this.categories = res
            }
        })

        this.destroyRef.onDestroy(() => {
            subscription.unsubscribe()
        })

        this.activatedRoute.paramMap.subscribe(params => {
            this.month = params.get("month") || '';
            this.currentYear = params.get("year") || '';
            this.getSalary(this.month)
            this.loadExpenses()
        })
    }

    // ADD FORM

    openAddDialog() {
        const dialog = document.getElementById("addExpenseDialog") as HTMLElement

        dialog.style.visibility = "unset"
    }

    hideAddDialog() {
        const dialog = document.getElementById("addExpenseDialog") as HTMLElement

        dialog.style.visibility = "hidden"
        this.submitErr = false;
    }


    addExpenseForm = new FormGroup({
        category: new FormControl('', { validators: [Validators.required] }),
        amount: new FormControl('', { validators: [Validators.required, Validators.min(0)] }),
        description: new FormControl('', { validators: [Validators.required] })
    })

    onAddExpense() {
        if (this.addExpenseForm.invalid) {
            this.submitErr = true;
            return
        }

        const subscription = this.expensesService.addNewExpense(
            {
                userId: localStorage.getItem("userId"),
                month: this.month,
                category: this.addExpenseForm.value.category,
                amount: this.addExpenseForm.value.amount,
                description: this.addExpenseForm.value.description,
                year: this.currentYear,
            }
        ).subscribe({
            next: (res) => {
                this.addExpenseForm.reset()
                this.loadExpenses()
                this.hideAddDialog()
                this.submitErr = false;
            },
            error: (err) => {
                this.submitErr = true;
            }
        })

        this.destroyRef.onDestroy(() => subscription.unsubscribe())
    }

    // EDIT FORM

    editExpenseForm = new FormGroup({
        id: new FormControl(0),
        category: new FormControl('', { validators: [Validators.required] }),
        amount: new FormControl('', { validators: [Validators.required, Validators.min(0)] }),
        description: new FormControl('', { validators: [Validators.required] })
    })

    openEditDialog(expenseId: number) {
        const dialog = document.getElementById("editExpenseDialog") as HTMLElement
        let currentExpense: any;

        const subscription = this.expensesService.getExpenseById(expenseId, localStorage.getItem("userId")!).subscribe({
            next: (res) => {
                currentExpense = res
                this.submitErr = false;

                this.editExpenseForm.patchValue({
                    id: expenseId,
                    category: currentExpense.category,
                    amount: currentExpense.amount,
                    description: currentExpense.description,
                })
            }
        })

        this.destroyRef.onDestroy(() => subscription.unsubscribe())
        dialog.style.visibility = "unset"
    }

    hideEditDialog() {
        const dialog = document.getElementById("editExpenseDialog") as HTMLElement

        dialog.style.visibility = "hidden"
        this.submitErr = false;
    }

    onEditExpense() {
        if (this.editExpenseForm.invalid) {
            this.submitErr = true;
            return
        }

        const subscription = this.expensesService.editExpense({
            id: this.editExpenseForm.value.id,
            category: this.editExpenseForm.value.category,
            amount: this.editExpenseForm.value.amount,
            description: this.editExpenseForm.value.description,
            userId: localStorage.getItem("userId")
        }).subscribe({
            next: (res) => {
                this.editExpenseForm.reset()
                this.loadExpenses()
                this.hideEditDialog()
                this.submitErr = false;
            },
            error: (err) => {
                this.submitErr = true;
            }
        })

        this.destroyRef.onDestroy(() => subscription.unsubscribe())
    }

    deleteExpense() {
        const subscription = this.expensesService.deleteExpense({
            id: this.editExpenseForm.value.id,
            userId: localStorage.getItem("userId")
        }).subscribe({
            next: (res) => {
                this.loadExpenses()
                this.hideEditDialog()
            }
        })
    }

    // SALARY FORM
    openSalaryAddDialog() {
        const dialog = document.getElementById("editSalaryDialog") as HTMLElement

        dialog.style.visibility = "unset"
    }

    hideSalaryDialog() {
        const dialog = document.getElementById("editSalaryDialog") as HTMLElement

        dialog.style.visibility = "hidden"
        this.submitErr = false;
    }

    editSalaryForm = new FormGroup({
        amount: new FormControl(0, { validators: [Validators.required, Validators.min(0)] }),
        month: new FormControl("", { validators: [Validators.required] })
    })

    getSalary(month: string) {
        const subscription = this.salaryService.getSalary(month, this.currentYear, localStorage.getItem("userId")!).subscribe({
            next: (res) => {
                this.salary = res
            }
        })

        this.destroyRef.onDestroy(() => subscription.unsubscribe())
    }

    onAddSalary() {
        const subscription = this.salaryService.addSalary(
            {
                amount: this.editSalaryForm.value.amount,
                month: this.month,
                userId: localStorage.getItem("userId"),
                year: this.currentYear
            }
        ).subscribe({
            next: (res) => {
                this.editSalaryForm.reset()
                this.getSalary(this.month)
                this.loadExpenses()
                this.hideSalaryDialog()
                this.submitErr = false;
            }
        })
        this.destroyRef.onDestroy(() => subscription.unsubscribe())
    }

    openSalaryEditDialog() {
        const dialog = document.getElementById("editSalaryDialog") as HTMLElement
        let currentSalary: any;

        const subscription = this.salaryService.getSalary(this.month, this.currentYear, localStorage.getItem("userId")!).subscribe({
            next: (res) => {
                currentSalary = res

                this.editSalaryForm.patchValue({
                    amount: currentSalary.amount,
                    month: this.month,
                })
            },
            error: (err) => {
                this.submitErr = true;
            }
        })

        this.destroyRef.onDestroy(() => subscription.unsubscribe())
        dialog.style.visibility = "unset"
    }

    onEditSalary() {
        if (this.editSalaryForm.invalid) {
            this.submitErr = true;
            return
        }

        const subscription = this.salaryService.editSalary({
            amount: this.editSalaryForm.value.amount,
            month: this.month,
            year: this.currentYear,
            userId: localStorage.getItem("userId")
        }).subscribe({
            next: (res) => {
                this.editSalaryForm.reset()
                this.getSalary(this.month)
                this.loadExpenses()
                this.hideSalaryDialog()
                this.submitErr = false;
            },
            error: (err) => {
                this.submitErr = true;
            }
        })

        this.destroyRef.onDestroy(() => subscription.unsubscribe())
    }

    // MEGTAKARÍTÁS KALKULÁCIÓ

    calculateSavings() {
        if (parseInt(this.salary.amount) && parseInt(this.expenseSum.sum)) {
            this.savings = parseInt(this.salary.amount) - parseInt(this.expenseSum.sum)
        } else {
            return
        }
    }
}
