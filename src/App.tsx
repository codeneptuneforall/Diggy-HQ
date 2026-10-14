import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { StoreProvider } from './contexts/StoreContext';
import { UIProvider } from './contexts/UIContext';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { CalendarPage } from './pages/events/CalendarPage';
import { EventsListPage } from './pages/events/EventsListPage';
import { EventDetailPage } from './pages/events/EventDetailPage';
import { TrailersPage } from './pages/trailers/TrailersPage';
import { TrailerDetailPage } from './pages/trailers/TrailerDetailPage';
import { EmployeesPage } from './pages/people/EmployeesPage';
import { EmployeeDetailPage } from './pages/people/EmployeeDetailPage';
import { SchedulePage } from './pages/people/SchedulePage';
import { CustomersPage } from './pages/customers/CustomersPage';
import { CustomerDetailPage } from './pages/customers/CustomerDetailPage';
import { FollowUpsPage } from './pages/customers/FollowUpsPage';
import { SalesReportsPage } from './pages/sales/SalesReportsPage';
import { SalesReportFormPage } from './pages/sales/SalesReportFormPage';
import { SalesReportDetailPage } from './pages/sales/SalesReportDetailPage';
import { MissingReportsPage } from './pages/sales/MissingReportsPage';
import { InventoryPage } from './pages/inventory/InventoryPage';
import { InventoryItemPage } from './pages/inventory/InventoryItemPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { FranchiseesPage } from './pages/admin/FranchiseesPage';
import { FranchiseDetailPage } from './pages/admin/FranchiseDetailPage';
import { TerritoriesPage } from './pages/admin/TerritoriesPage';
import { TerritoryDetailPage } from './pages/admin/TerritoryDetailPage';
import { UsersPage } from './pages/admin/UsersPage';
import { AuditTrailPage } from './pages/admin/AuditTrailPage';
import { SettingsPage } from './pages/SettingsPage';
import { SignInPage } from './pages/SignInPage';
import { MobilePage } from './pages/MobilePage';
import { CorporateOnly } from './components/layout/CorporateOnly';

type AppProps = {
  /** Which web persona is signed in. */
  role?: 'corporate' | 'franchiseOwner';
  /** Show the web admin or the iOS/Android app. */
  surface?: 'web' | 'mobile';
  /** Who is using the mobile app. */
  mobilePersona?: 'employee' | 'manager';
};

export function App({ role = 'corporate', surface = 'web', mobilePersona = 'employee' }: AppProps) {
  return (
    <StoreProvider initialRole={role === 'corporate' ? 'corporate' : 'franchise'}>
      <UIProvider>
        <BrowserRouter>
          <Toaster position="bottom-right" richColors closeButton toastOptions={{ style: { fontFamily: 'Inter, sans-serif' } }} />
          {surface === 'mobile' ?
          <MobilePage persona={mobilePersona} /> :

          <Routes>
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/mobile" element={<MobilePage persona={mobilePersona} />} />
              <Route element={<AppShell />}>
                <Route index element={<Dashboard />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="events" element={<EventsListPage />} />
                <Route path="events/:id" element={<EventDetailPage />} />
                <Route path="trailers" element={<TrailersPage />} />
                <Route path="trailers/:id" element={<TrailerDetailPage />} />
                <Route path="employees" element={<EmployeesPage />} />
                <Route path="employees/:id" element={<EmployeeDetailPage />} />
                <Route path="schedule" element={<SchedulePage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="customers/:id" element={<CustomerDetailPage />} />
                <Route path="follow-ups" element={<FollowUpsPage />} />
                <Route path="sales-reports" element={<SalesReportsPage />} />
                <Route path="sales-reports/new" element={<SalesReportFormPage />} />
                <Route path="sales-reports/:id" element={<SalesReportDetailPage />} />
                <Route path="missing-reports" element={<MissingReportsPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="inventory/:id" element={<InventoryItemPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="franchisees" element={<CorporateOnly area="franchisee administration"><FranchiseesPage /></CorporateOnly>} />
                <Route path="franchisees/:id" element={<CorporateOnly area="franchisee administration"><FranchiseDetailPage /></CorporateOnly>} />
                <Route path="territories" element={<CorporateOnly area="territories"><TerritoriesPage /></CorporateOnly>} />
                <Route path="territories/:id" element={<CorporateOnly area="territories"><TerritoryDetailPage /></CorporateOnly>} />
                <Route path="users" element={<CorporateOnly area="users & permissions"><UsersPage /></CorporateOnly>} />
                <Route path="audit" element={<AuditTrailPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          }
        </BrowserRouter>
      </UIProvider>
    </StoreProvider>);

}