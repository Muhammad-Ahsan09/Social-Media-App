import { Outlet } from "react-router-dom";
import LeftSidebar from "./components/LeftSidebar";
import TopNavbar from "./components/TopNavbar";
import BottomNavbar from "./components/BottomNavbar";

const MainLayout = ({ setUser, currentUserId }) => {
  return (
    <div className="min-h-screen md:flex">
      {/* Desktop Sidebar */}
      <LeftSidebar
        setUser={setUser}
        currentUserId={currentUserId}
      />

      <div className="min-w-0 flex-1 flex flex-col">
        {/* Top Navbar */}
        <TopNavbar setUser={setUser} />

        {/* Page Content */}
        <main className="flex-1">
          <Outlet />
        </main>

        {/* Bottom Navbar */}
        <BottomNavbar currentUserId={currentUserId}/>
      </div>
    </div>
  );
};
export default MainLayout;