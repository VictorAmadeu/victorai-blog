import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ArticlesComponent } from './pages/articles/articles.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { AboutComponent } from './pages/about/about.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'articulos', component: ArticlesComponent },
  { path: 'categorias', component: CategoriesComponent },
  { path: 'sobre-mi', component: AboutComponent },
  { path: '**', redirectTo: '' },
];
