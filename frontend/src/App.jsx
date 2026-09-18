import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import CookieConsent from "./components/CookieConsent";
import GlobalChatWidget from "./components/GlobalChatWidget";
import Home from "./pages/Home";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import TeamPage from "./pages/TeamPage";
import ContactPage from "./pages/ContactPage";
import ResourcesPage from "./pages/ResourcesPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import CaseStudiesPage from "./pages/CaseStudiesPage";
import CaseStudyDetailPage from "./pages/CaseStudyDetailPage";
import EnterprisePage from "./pages/EnterprisePage";
import ScorecardPage from "./pages/ScorecardPage";
import VerifyPage from "./pages/VerifyPage";
import Login from "./pages/Login";
import LoginOtp from "./pages/LoginOtp";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import LearnPage from "./pages/LearnPage";
import ExamEntryPage from "./pages/ExamEntryPage";
import ExamTakePage from "./pages/ExamTakePage";
import ExamResultPage from "./pages/ExamResultPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import InternshipsPage from "./pages/InternshipsPage";
import InternshipDetailPage from "./pages/InternshipDetailPage";
import GalleryPage from "./pages/GalleryPage";
import CareersPage from "./pages/CareersPage";
import InstitutionsPage from "./pages/InstitutionsPage";
import ProjectsPage from "./pages/ProjectsPage";
import ResearchPage from "./pages/ResearchPage";

function ProtectedRoute({
  component: Component,
  adminOnly = false
}) {
  const {
    user,
    isLoading
  } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>;
  if (!user) return <Redirect to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Redirect to="/dashboard" />;
  return <Component />;
}

function Router() {
  return <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={AboutPage} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/services/:slug" component={ServiceDetailPage} />
      <Route path="/courses" component={CoursesPage} />
      <Route path="/courses/:slug" component={CourseDetailPage} />
      <Route path="/learn/:slug" component={LearnPage} />
      <Route path="/exam" component={ExamEntryPage} />
      <Route path="/exam/take/:code" component={ExamTakePage} />
      <Route path="/exam/result/:attemptId" component={ExamResultPage} />
      <Route path="/internships" component={InternshipsPage} />
      <Route path="/internships/:slug" component={InternshipDetailPage} />
      <Route path="/gallery" component={GalleryPage} />
      <Route path="/careers" component={CareersPage} />
      <Route path="/institutions" component={InstitutionsPage} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/research" component={ResearchPage} />
      <Route path="/team" component={TeamPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/resources" component={ResourcesPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/case-studies" component={CaseStudiesPage} />
      <Route path="/case-studies/:slug" component={CaseStudyDetailPage} />
      <Route path="/enterprise" component={EnterprisePage} />
      <Route path="/security-scorecard" component={ScorecardPage} />
      <Route path="/verify/:certificateId" component={VerifyPage} />
      <Route path="/login" component={Login} />
      <Route path="/login-otp" component={LoginOtp} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password/:token" component={ResetPassword} />
      <Route path="/dashboard">
        {() => <ProtectedRoute component={UserDashboard} />}
      </Route>
      <Route path="/admin">
        {() => <ProtectedRoute component={AdminDashboard} adminOnly />}
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>;
}

function App() {
  return <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <CookieConsent />
            <GlobalChatWidget />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>;
}
export default App;
