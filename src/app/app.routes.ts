import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { DashboardComponent } from './Components/dashboard/dashboard.component';
import { LandingComponent } from './Components/landing/landing.component';
import { LoginComponent } from './Components/login/login.component';
import { LogoutComponent } from './Components/logout/logout.component';
import { RegisterComponent } from './Components/register/register.component';

export const routes: Routes = [
    { path: '', component: LoginComponent},
    { path: 'dashboard', component: LandingComponent },
    // { path: 'dashboard/:month', component: DashboardComponent },
    { path: 'dashboard/:userid/:month', component: DashboardComponent },

    { path: 'login', component: LoginComponent},
    { path: 'logout', component: LogoutComponent },

    { path: 'register', component: RegisterComponent },

    { path: "**", component: LandingComponent}
];
