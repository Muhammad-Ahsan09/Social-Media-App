
import { useEffect, useState, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
import MainLayout from "./MainLayout";
import { lazy } from "react"


const Scenes = lazy(() => import("./pages/Scenes"))
const Discover = lazy(() => import("./pages/Discover"))
const Home = lazy(() => import("./pages/Home"))
const Signup = lazy(() => import("./pages/Signup"))
const Login = lazy(() => import("./pages/Login"))
const MyProfilePage = lazy(() => import("./pages/MyProfilePage"))
const FriendRequests = lazy(() => import("./pages/FriendRequests"))
const MyFriends = lazy(() => import("./pages/MyFriends"))
const Chat = lazy(() => import("./pages/Chat"))
const SearchPage = lazy(() => import("./pages/SearchPage"))
const PostDetail = lazy(() => import("./pages/PostDetail"))
const Explore = lazy(() => import("./pages/Explore"))
const Journeys = lazy(() => import("./pages/Journeys"))
const JourneyDetails = lazy(() => import("./pages/JourneyDetails"))

const App = () => {
  const [user, setUser] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const getUserStatus = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/issignedin`,
          { credentials: "include" }
        );

        if (!res.ok) {
          throw new Error("Failed to check authentication");
        }

        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error("Authentication check failed:", error);
        setUser(false);
      } finally {
        setAuthLoading(false);
      }
    };

    getUserStatus();
  }, []);

  // Do not redirect while the session is being checked.
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F7F4] text-[#294C46] dark:bg-gray-950 dark:text-[#E1EAE4]">
        Loading Solace...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              user
                ? <Navigate to={`/${user.id}`} replace />
                : <Signup setUser={setUser} />
            }
          />

          <Route
            path="/signup"
            element={
              user
                ? <Navigate to={`/${user.id}`} replace />
                : <Signup setUser={setUser} />
            }
          />

          <Route
            path="/login"
            element={
              user
                ? <Navigate to={`/${user.id}`} replace />
                : <Login setUser={setUser} />
            }
          />

          {/* Shared layout for authenticated pages */}
          <Route
            element={
              user
                ? (
                    <MainLayout
                      setUser={setUser}
                      currentUserId={user.id}
                    />
                  )
                : <Navigate to="/signup" replace />
            }
          >
            <Route
              path="/:userid"
              element={
                <Home
                  setUser={setUser}
                  currentUserId={user.id}
                />
              }
            />

            <Route
              path="/profile/:userid"
              element={
                <MyProfilePage
                  setUser={setUser}
                  currentUserId={user.id}
                />
              }
            />

            <Route
              path="/friend_requests"
              element={
                <FriendRequests
                  setUser={setUser}
                  currentUserId={user.id}
                />
              }
            />

            <Route
              path="/my_friends"
              element={
                <MyFriends
                  setUser={setUser}
                  currentUserId={user.id}
                />
              }
            />

            <Route
              path="/chats/:friend_id"
              element={
                <Chat
                  setUser={setUser}
                  currentUserId={user.id}
                />
              }
            />

            <Route
              path="/posts/:post_id"
              element={
                <PostDetail
                  setUser={setUser}
                  currentUserId={user.id}
                />
              }
            />

            <Route
              path="/journeys"
              element={
                <Journeys
                  setUser={setUser}
                  currentUserId={user.id}
                />
              }
            />

            <Route
              path="/journeys/:journeyId"
              element={<JourneyDetails />}
            />

            <Route
              path="/scenes"
              element={
                <Scenes
                  setUser={setUser}
                  currentUserId={user.id}
                />
              }
            />

            <Route
              path="/discover"
              element={
                <Discover
                  setUser={setUser}
                  currentUserId={user.id}
                />
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
