import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import DashboardPage from "@/pages/dashboard-page";
import EventsPage from "@/pages/events-page";
import StudiesPage from "@/pages/studies-page";
import PostsPage from "@/pages/posts-page";
import ForumPage from "@/pages/forum-page";
import UsersPage from "@/pages/users-page";
import SiteEditorPage from "@/pages/site-editor-page";
import SettingsPage from "@/pages/settings-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  const [location] = useLocation();

  // Ajuda a identificar qual aba está ativa no menu
  const isAdminPage = 
    location.startsWith("/dashboard") || 
    location.startsWith("/users") || 
    location.startsWith("/site-editor");

  return (
    <Switch>
      {/* Páginas públicas */}
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Páginas protegidas com autenticação */}
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/events" component={EventsPage} />
      <ProtectedRoute path="/studies" component={StudiesPage} />
      <ProtectedRoute path="/posts" component={PostsPage} />
      <ProtectedRoute path="/forum" component={ForumPage} />
      <ProtectedRoute path="/users" component={UsersPage} />
      <ProtectedRoute path="/site-editor" component={SiteEditorPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      
      {/* Página de erro 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
