import { createBrowserRouter } from "react-router-dom";
import { AdminLayout } from "./layouts/AdminLayout";
import { OwnerLayout } from "./layouts/OwnerLayout";
import { PlayerLayout } from "./layouts/PlayerLayout";
import { RootLayout } from "./layouts/RootLayout";
import { AdminConfigPage } from "../pages/admin/AdminConfigPage";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AssistantChatbotPage } from "../pages/assistant/AssistantChatbotPage";
import { LandingPage } from "../pages/LandingPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { OwnerCheckInPage } from "../pages/owner/OwnerCheckInPage";
import { OwnerCourtsPage } from "../pages/owner/OwnerCourtsPage";
import { OwnerDashboardPage } from "../pages/owner/OwnerDashboardPage";
import { PlayerBookingPage } from "../pages/player/PlayerBookingPage";
import { PlayerBookingSuccessPage } from "../pages/player/PlayerBookingSuccessPage";
import { PlayerBookingsPage } from "../pages/player/PlayerBookingsPage";
import { PlayerDiscoveryPage } from "../pages/player/PlayerDiscoveryPage";
import { PlayerAssessmentPage } from "../pages/player/PlayerAssessmentPage";
import { PlayerPoolPostsPage } from "../pages/player/PlayerPoolPostsPage";
import { PlayerRentCourtsPage } from "../pages/player/PlayerRentCourtsPage";
import { PlayerSessionDetailPage } from "../pages/player/PlayerSessionDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      {
        path: "player",
        element: <PlayerLayout />,
        children: [
          { path: "discovery", element: <PlayerDiscoveryPage /> },
          { path: "pool-posts", element: <PlayerPoolPostsPage /> },
          { path: "rent-courts", element: <PlayerRentCourtsPage /> },
          { path: "session/:sessionId", element: <PlayerSessionDetailPage /> },
          { path: "booking/:sessionId", element: <PlayerBookingPage /> },
          { path: "booking-success/:bookingId", element: <PlayerBookingSuccessPage /> },
          { path: "bookings", element: <PlayerBookingsPage /> },
          { path: "assessment", element: <PlayerAssessmentPage /> },
        ],
      },
      { path: "assistant/chatbot", element: <AssistantChatbotPage /> },
      {
        path: "owner",
        element: <OwnerLayout />,
        children: [
          { path: "dashboard", element: <OwnerDashboardPage /> },
          { path: "courts", element: <OwnerCourtsPage /> },
          { path: "check-in", element: <OwnerCheckInPage /> },
        ],
      },
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          { path: "dashboard", element: <AdminDashboardPage /> },
          { path: "config", element: <AdminConfigPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
