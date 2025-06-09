// app-routing.module.ts
import { AppComponent } from './app.component';
import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'app', 
    pathMatch: 'full' 
  },
  { 
    path: 'app', 
    component: AppComponent
  }
];