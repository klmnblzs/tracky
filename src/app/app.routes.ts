import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { DashboardComponent } from './Components/dashboard/dashboard.component';
import { LandingComponent } from './Components/landing/landing.component';
import { LoginComponent } from './Components/login/login.component';
import { LogoutComponent } from './Components/logout/logout.component';

export const routes: Routes = [
    { path: '', component: LandingComponent},
    { path: 'dashboard', component: LandingComponent },
    { path: 'dashboard/:month', component: DashboardComponent },

    { path: 'login', component: LoginComponent},
    { path: 'logout', component: LogoutComponent },

    { path: "**", component: LandingComponent}
];
