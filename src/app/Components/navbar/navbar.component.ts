import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';


interface DateObject {
  date: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  months: string[] = ["Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"]
  userId = localStorage.getItem("userId")

  removeEkezet(input: string): string {
    const ekezetek: { [key: string]: string } = {
        á: 'a', é: 'e', í: 'i', ó: 'o', ö: 'o', ő: 'o', ú: 'u', ü: 'u', ű: 'u',
        Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ö: 'O', Ő: 'O', Ú: 'U', Ü: 'U', Ű: 'U'
    };

    return input.split('').map(char => ekezetek[char] || char).join('');
  }

  onClick(month: string) {
    console.log(this.removeEkezet(month.toLocaleLowerCase()))
  }
}
