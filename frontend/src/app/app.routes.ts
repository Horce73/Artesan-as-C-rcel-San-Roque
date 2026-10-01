import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CatalogComponent } from './pages/catalog/catalog.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { TraceabilityComponent } from './pages/traceability/traceability.component';
import { OrdersTrackerComponent } from './pages/orders-tracker/orders-tracker.component';
import { LoginComponent } from './pages/admin/login.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'catalogo', component: CatalogComponent },
  { path: 'producto/:id', component: ProductDetailComponent },
  { path: 'trazabilidad', component: TraceabilityComponent },
  { path: 'trazabilidad/:code', component: TraceabilityComponent },
  { path: 'pedidos/rastreo', component: OrdersTrackerComponent },
  { path: 'admin/login', component: LoginComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
