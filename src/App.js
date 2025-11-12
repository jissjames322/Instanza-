import React, {
  useEffect,
  createContext,
  useReducer,
  useContext,
  useState,
} from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import AdminDashboard from './components/admin/AdminDashboard'
import Home from "./components/screens/Home";
import More from "./components/screens/More";
import Reels from "./components/screens/Reels";
import CreateStory from "./components/screens/CreateStory";
import CreateReel from "./components/screens/CreateReel";
import Messages from "./components/screens/Messages";
import SignUp from "./components/screens/SignUp";
import Profile from "./components/screens/Profile";
import SignIn from "./components/screens/SignIn";
import UserProfile from "./components/screens/UserProfile";
import CreatePost from "./components/screens/CreatePost";
import FollowersPost from "./components/screens/FollowersPost";
import { reducer, initialState } from "./reducers/userReducer";
import { useLocation } from "react-router-dom"; // add this import
import Reset from "./components/screens/Reset";
import ResetPassword from "./components/screens/ResetPassword";
import LoadingScreen from "./components/common/LoadingScreen";
import ChatBot from './components/AI/ChatBot'
import { Toaster } from "react-hot-toast";

// Context
import { SocketProvider } from "./components/socket/SocketContext";

export const UserContext = createContext();

const Routing = () => {
  const navigate = useNavigate();
  const location = useLocation(); // get current path

  const { state, dispatch } = useContext(UserContext);
  const [loading, setLoading] = React.useState(true);
  const [animationCompleted, setAnimationCompleted] = useState(false);

useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user) {
    dispatch({ type: "USER", payload: user });

    // If user is not admin and trying to access admin dashboard, redirect away
    if (!user.isAdmin && location.pathname.startsWith("/admin")) {
      navigate("/");
    }
  } else {
    if (
      location.pathname !== "/signin" &&
      location.pathname !== "/signup" &&
      !location.pathname.startsWith("/reset")
    ) {
      navigate("/signin");
    }
  }
}, [dispatch, navigate, location.pathname]);
  if (loading && !animationCompleted) {
    return (
      <LoadingScreen
        onComplete={() => {
          setAnimationCompleted(true);
          setLoading(false);
        }}
      />
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/more" element={<More />} />
      <Route path="/messages" element={<Messages />} />
      <Route exact path="/profile" element={<Profile />} />
      <Route path="/createpost" element={<CreatePost />} />
      <Route path="/profile/:userid" element={<UserProfile />} />
      <Route path="/feed" element={<FollowersPost />} />
      <Route exact path="/reset" element={<Reset />} />
      <Route path="/reset/:token" element={<ResetPassword />} />
      <Route path="/reels" element={<Reels />} />
      <Route path="/create-story" element={<CreateStory />} />
      <Route path="/create-reel" element={<CreateReel />} />
    </Routes>
  );
};

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <UserContext.Provider value={{ state, dispatch }}>
      <div className="bg-black text-white">
        {" "}
        {/* default dark theme */}
        <BrowserRouter>
          <SocketProvider>
            <Routing />
            {/* Toast messages will appear here */}
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: "#333",
                  color: "#fff",
                },
              }}
            />
          </SocketProvider>
        </BrowserRouter>
      </div>
    </UserContext.Provider>
  );
}

export default App;
