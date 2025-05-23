import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet
} from "react-router-dom";
import { useEffect, useState } from "react";
/* Restrict */
import AdminRoute from "./routes/AdminRoute";

/* routes */
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import { supabase } from "./lib/supabase";
import Settings from "./pages/Settings/Settings";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ResetPassword from "./pages/auth/ResetPassword";
import PlatformUsers from "./pages/Users/PlatformUsers";
import PublisherDashboard from "./pages/Publisher/Dashboard";
import AdvertiserDashboard from "./pages/Advertiser/Dashboard";
import PlatformUserProfile from "./pages/PlatformUserProfile";
import Pages from "./pages/Pages/Pages";
import EditPage from "./pages/Pages/EditPage";
import ViewPage from "./pages/Pages/ViewPage";
import MenuDash from "./pages/MenuDash/MenuDash";
import EditMenuItem from "./pages/MenuDash/EditMenuItem";
import Forms from "./pages/Forms/Forms";
import EditForm from "./pages/Forms/EditForm";
import FormSettings from "./pages/Forms/FormSettings";
import FormPreview from "./pages/Forms/FormPreview";
import ServicePackages from "./pages/ServicePackages/ServicePackages";
import ServicePackagesCards from "./pages/ServicePackages/ServicePackagesCards";
import DynamicFavicon from "./components/common/DynamicFavicon";
import EditorialManager from "./pages/EditorialManager/EditorialManager";
import Checkout from "./pages/Checkout";

function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        setIsAuthenticated(true);
      } else if (event === "SIGNED_OUT") {
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkAuth() {
    try {
      setLoading(true);
      const {
        data: { session }
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    } catch (error) {
      console.error("Auth check error:", error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <DynamicFavicon />
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forms/preview/:id" element={<FormPreview />} />

        {/* Admin Routes */}
        <Route path="/adm" element={<Login />} />
        <Route path="/adm/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route
          element={
            <AuthenticatedRoute>
              <AppLayout />
            </AuthenticatedRoute>
          }
        >
          <Route path="/dashboard" element={<Home />} />
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/blank" element={<Blank />} />
          <Route path="/form-elements" element={<FormElements />} />
          <Route path="/basic-tables" element={<BasicTables />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/avatars" element={<Avatars />} />
          <Route path="/badge" element={<Badges />} />
          <Route path="/buttons" element={<Buttons />} />
          <Route path="/images" element={<Images />} />
          <Route path="/line-chart" element={<LineChart />} />
          <Route path="/bar-chart" element={<BarChart />} />
          <Route path="/users" element={<PlatformUsers />} />
          <Route path="/pages" element={<Pages />} />
          <Route path="/pages/new" element={<EditPage />} />
          <Route path="/pages/edit/:id" element={<EditPage />} />
          <Route path="/pages/:slug" element={<ViewPage />} />
          <Route path="/menu-dash" element={<MenuDash />} />
          <Route path="/menu-dash/new" element={<EditMenuItem />} />
          <Route path="/menu-dash/edit/:id" element={<EditMenuItem />} />
          <Route path="/forms" element={<Forms />} />
          <Route path="/forms/edit/:id" element={<EditForm />} />
          <Route path="/forms/settings/:id" element={<FormSettings />} />

          <Route /* adm route */
            element={
              <AdminRoute>
                <Outlet />
              </AdminRoute>
            }
          >
            <Route path="/service-packages" element={<ServicePackages />} />
            <Route
              path="/service-packages/:id"
              element={<ServicePackagesCards />}
            />
          </Route>

          <Route path="/editorial" element={<EditorialManager />} />
          <Route path="/checkout" element={<Checkout />} />
        </Route>

        {/* Protected Publisher Routes */}
        <Route
          element={
            <AuthenticatedRoute>
              <AppLayout />
            </AuthenticatedRoute>
          }
        >
          <Route path="/publisher/dashboard" element={<PublisherDashboard />} />
          <Route
            path="/publisher/profile"
            element={<PlatformUserProfile userType="publisher" />}
          />
        </Route>

        {/* Protected Advertiser Routes */}
        <Route
          element={
            <AuthenticatedRoute>
              <AppLayout />
            </AuthenticatedRoute>
          }
        >
          <Route
            path="/advertiser/dashboard"
            element={<AdvertiserDashboard />}
          />
          <Route
            path="/advertiser/profile"
            element={<PlatformUserProfile userType="advertiser" />}
          />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
