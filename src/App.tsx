import { Authenticated, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
  ErrorComponent,
  RefineSnackbarProvider,
  useNotificationProvider,
} from "@refinedev/mui";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import routerProvider, { DocumentTitleHandler } from "@refinedev/react-router";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router";
import {
  taruviDataProvider,
  taruviAuthProvider,
  taruviStorageProvider,
  taruviAppProvider,
  taruviUserProvider,
  taruviAccessControlProvider,
} from "./providers/refineProviders";
import { CustomSider, ErrorBoundary, UnsavedChangesDialog } from "./components";
import { LoginRedirect } from "./components/auth/LoginRedirect";
import { ColorModeContextProvider } from "./contexts/color-mode";
import {AppSettingsProvider, useAppSettings} from "./contexts/app-settings";
import { Home } from "./pages/home";
import { AccountPreferences } from "./pages/account";
import { Categories } from "./pages/categories";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import { Login } from "./pages/login";
import { ErpWorkspaceHeader } from "./components/ErpWorkspaceHeader";
import { ERP_SIDEBAR_WIDTH } from "./components/sidenav/MuiSidenav";
import { ERP_MODULES, buildErpResources } from "./erp/modules";
import { ErpModulePage } from "./pages/erp";

// Mount only after the existing auth provider has validated the session.
const AuthenticatedLayout = () => {
  const { settings } = useAppSettings();
  return (
    <>
      <CustomSider />
      <Box sx={{ ml: { xs: 0, md: `${ERP_SIDEBAR_WIDTH}px` }, minWidth: 0 }}>
        <ErpWorkspaceHeader />
        <ErrorBoundary><Outlet /></ErrorBoundary>
      </Box>
      <RefineKbar />
      <UnsavedChangesDialog />
      <DocumentTitleHandler handler={() => settings?.displayName || ""} />
    </>
  );
};

const SessionLoading = () => (
  <Box role="status" aria-label="Checking session" sx={{ p: 3 }}>
    <Skeleton variant="rounded" height={56} />
    <Typography variant="body2" sx={{ mt: 2 }}>Checking session...</Typography>
  </Box>
);

const AppContent = () => (
  <RefineSnackbarProvider>
    <DevtoolsProvider>
      <Refine
        dataProvider={{
          default: taruviDataProvider,
          storage: taruviStorageProvider,
          app: taruviAppProvider,
          user: taruviUserProvider,
        }}
        notificationProvider={useNotificationProvider}
        routerProvider={routerProvider}
        authProvider={taruviAuthProvider}
        accessControlProvider={taruviAccessControlProvider}
        resources={buildErpResources()}
        options={{
          syncWithLocation: true,
          warnWhenUnsavedChanges: true,
          projectId: "obEpHJ-M7JimA-31GF1J",
        }}
      >
        <Routes>
          <Route
            element={
              <Authenticated key="login-route" fallback={<Outlet />} loading={<SessionLoading />}>
                <Navigate to="/" replace />
              </Authenticated>
            }
          >
            <Route path="/login" element={<Login />} />
          </Route>
          <Route
            element={
              <Authenticated
                key="authenticated-inner"
                fallback={<LoginRedirect />}
                loading={<SessionLoading />}
              >
                <AppSettingsProvider>
                  <AuthenticatedLayout />
                </AppSettingsProvider>
              </Authenticated>
            }
          >
            <Route index element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/settings/account" element={<AccountPreferences />} />
            {ERP_MODULES.filter(module => !["dashboard","categories","account"].includes(module.key)).map(module => (
              <Route key={module.key}>
                <Route path={module.path} element={<ErpModulePage moduleKey={module.key} action="list" />} />
                <Route path={`${module.path}/create`} element={<ErpModulePage moduleKey={module.key} action="create" />} />
                <Route path={`${module.path}/show/:id`} element={<ErpModulePage moduleKey={module.key} action="show" />} />
                <Route path={`${module.path}/edit/:id`} element={<ErpModulePage moduleKey={module.key} action="edit" />} />
              </Route>
            ))}
            <Route path="*" element={<ErrorComponent />} />
          </Route>
        </Routes>
      </Refine>
      <DevtoolsPanel />
    </DevtoolsProvider>
  </RefineSnackbarProvider>
);

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
            <CssBaseline />
            <GlobalStyles
              styles={{
                html: { WebkitFontSmoothing: 'antialiased' },
                body: { fontFamily: "'Open Sans', sans-serif" },
                '*::-webkit-scrollbar': { width: 8, height: 8 },
                '*::-webkit-scrollbar-track': { background: 'transparent' },
                '*::-webkit-scrollbar-thumb': {
                  background: 'rgba(0,0,0,0.18)',
                  borderRadius: 8,
                },
                '*::-webkit-scrollbar-thumb:hover': { background: 'rgba(0,0,0,0.32)' },
                '[data-theme="dark"] *::-webkit-scrollbar-thumb': {
                  background: 'rgba(255,255,255,0.18)',
                },
              }}
            />
            <AppContent />
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
