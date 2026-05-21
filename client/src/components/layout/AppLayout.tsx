import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import BottomNav from "./BottomNav";
import ErrorBoundary from "@/components/ErrorBoundary";

function AppLayout() {
  return (
    <div className="flex h-[100dvh] bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

export default AppLayout;