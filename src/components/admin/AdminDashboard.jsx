import React, { useEffect, useState, useRef, useCallback } from "react";
import API from "../api/axios";
import { FaUserCheck, FaUserTimes } from "react-icons/fa";
import { FiUsers, FiCheckCircle, FiXCircle, FiGrid } from "react-icons/fi";
import { gsap } from "gsap";
import Sidebar from "../common/Sidebar";
import toast from "react-hot-toast";
// ------------------------------------------------------------------
// Import Recharts components
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Sector,
} from "recharts";
// ------------------------------------------------------------------

// --- New Insight Card Component (Kept from previous) ---
const InsightCard = ({ title, value, icon: Icon, colorClass }) => (
  <div
    className={`bg-[#202437] rounded-xl shadow-2xl p-6 flex flex-col justify-between h-40 transition-transform duration-300 hover:scale-[1.02] border-t-4 ${colorClass}`}
  >
    <div className="flex justify-between items-start">
      <div className="flex flex-col">
        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          {title}
        </p>
        <div className="text-4xl font-extrabold text-white mt-1">{value}</div>
      </div>
      <div
        className={`p-3 rounded-full shadow-lg text-white ${colorClass
          .replace("border-t-4", "bg")
          .replace("-500", "-600")}`}
      >
        <Icon size={28} />
      </div>
    </div>
    <div className="text-xs text-gray-500 mt-2">
      <span className="text-green-400 font-semibold">
        {title.includes("Total") ? `Total: ${value}` : "Click for details"}
      </span>
    </div>
  </div>
);

// --- New Animated Pie Chart Component ---
const UserVerificationPieChart = ({ verified, unverified }) => {
  // Data for the Pie Chart
  const data = [
    { name: "Verified", value: verified, color: "#4CAF50" }, // Green
    { name: "Unverified", value: unverified, color: "#F44336" }, // Red
  ];

  // Custom Active Shape Render for a cool hover effect
  const renderActiveShape = useCallback((props) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
    } = props;

    return (
      <g>
        <text
          x={cx}
          y={cy - 10}
          dy={8}
          textAnchor="middle"
          fill="#FFFFFF"
          className="font-bold text-xl"
        >
          {payload.name}
        </text>
        <text
          x={cx}
          y={cy + 10}
          dy={8}
          textAnchor="middle"
          fill="#B0B0B0"
          className="text-sm"
        >
          {`(${(percent * 100).toFixed(0)}%)`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 5} // slightly larger on hover
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="#10131d"
          strokeWidth={2}
        />
      </g>
    );
  }, []);

  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = useCallback((_, index) => {
    setActiveIndex(index);
  }, []);

  return (
    <div className="lg:col-span-2 bg-[#202437] rounded-xl shadow-2xl p-4 h-[350px]">
      <h3 className="text-lg font-semibold text-white mb-2 ml-2">
        User Verification Ratio
      </h3>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={onPieEnter}
            animationDuration={1000} // Animation effect
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#2e3450",
              border: "none",
              borderRadius: "5px",
              color: "white",
            }}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ color: "white" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
// --- End New Animated Pie Chart Component ---

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const dashboardRef = useRef();

  // GSAP animation on dashboard mount
  useEffect(() => {
    gsap.fromTo(
      dashboardRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.5, ease: "power3.out" }
    );
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      toast.error("Failed to load users");
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await API.get("/admin/posts");
      setPosts(res.data);
    } catch (err) {
      toast.error("Failed to load posts");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPosts();
  }, []);

  // Verification/Deletion logic remains the same... (omitted for brevity)

  const verifyUser = async (userId) => {
    try {
      await API.put(`/admin/user/${userId}/verify`);
      fetchUsers();
      toast.success("User verified");
    } catch (err) {
      toast.error("Failed to verify user");
    }
  };

  const unverifyUser = async (userId) => {
    try {
      await API.put(`/admin/user/${userId}/unverify`);
      fetchUsers();
      toast.success("User unverified");
    } catch (err) {
      toast.error("Failed to unverify user");
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await API.delete(`/admin/user/${userId}`);
      fetchUsers();
      toast.success("User deleted");
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await API.delete(`/admin/post/${postId}`);
      fetchPosts();
      toast.success("Post deleted");
    } catch (err) {
      toast.error("Failed to delete post");
    }
  };

  // Analytics
  const verifiedUsers = users.filter((u) => u.isVerified).length;
  const unverifiedUsers = users.length - verifiedUsers;

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-tl from-[#2e3450] via-[#222b43] to-[#434674]">
      {/* Your global Sidebar */}
      <Sidebar />

      {/* Dashboard main area */}
      <main ref={dashboardRef} className="flex-1 md:ml-64 p-7">
        <h1 className="font-extrabold text-3xl text-white mb-8 drop-shadow-md">
          Admin Dashboard
        </h1>

        {/* --- INSIGHTS SECTION with Chart (MUI-Look) --- */}
        <section className="mb-10">
          <h2 className="text-xl  text-white mb-5">
            Key Insights & Analytics
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
            {/* Chart takes up 2/6 columns on large screens */}
            <UserVerificationPieChart
              verified={verifiedUsers}
              unverified={unverifiedUsers}
            />

            {/* Cards take up 4/6 columns on large screens */}
            <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Insight 1: Total Users */}
              <InsightCard
                title="Total Users"
                value={users.length}
                icon={FiUsers}
                colorClass="border-t-4 border-blue-500"
              />
              {/* Insight 2: Total Posts */}
              <InsightCard
                title="Total Posts"
                value={posts.length}
                icon={FiGrid}
                colorClass="border-t-4 border-red-500"
              />
              {/* Insight 3: Verified Users (Detailed) */}
              <InsightCard
                title="Verified"
                value={verifiedUsers}
                icon={FaUserCheck}
                colorClass="border-t-4 border-green-500"
              />
              {/* Insight 4: Unverified Users (Detailed) */}
              <InsightCard
                title="Unverified"
                value={unverifiedUsers}
                icon={FaUserTimes}
                colorClass="border-t-4 border-yellow-500"
              />
            </div>
          </div>
        </section>
        {/* --- END INSIGHTS SECTION --- */}

        <hr className="my-8 border-t border-[#3a415b]" />

        {/* User Table and Posts Table sections remain unchanged */}
        {/* ... (rest of the component) ... */}

        <section>
          <h2 className="text-xl  text-white mb-5">Manage Users</h2>
          <div className="rounded-xl overflow-hidden bg-[#10131d] bg-opacity-80 backdrop-blur-md shadow-lg">
            <table className="min-w-full text-gray-200">
              <thead className="bg-[#202437]">
                <tr>
                  <th className="p-3">Username</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Verified</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="transition hover:bg-[#282e45]">
                    <td className="p-3 font-medium flex gap-2 items-center">
                      {user.username}
                      {user.isVerified && (
                        <img
                          src="/badge/vbadge.png"
                          alt="Verified Badge"
                          className="w-6 h-6 ml-2 inline-block "
                          title="Verified User"
                        />
                      )}
                    </td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">
                      {user.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-green-400">
                          <FiCheckCircle /> Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400">
                          <FiXCircle /> No
                        </span>
                      )}
                    </td>
                    <td className="p-3 space-x-2">
                      {user.isVerified ? (
                        <button
                          onClick={() => unverifyUser(user._id)}
                          className="bg-yellow-500 px-3 py-1 rounded text-white hover:bg-yellow-600"
                        >
                          Unverify
                        </button>
                      ) : (
                        <button
                          onClick={() => verifyUser(user._id)}
                          className="bg-green-500 px-3 py-1 rounded text-white hover:bg-green-600"
                        >
                          Verify
                        </button>
                      )}
                      <button
                        className="bg-red-500 px-3 py-1 rounded text-white hover:bg-red-600"
                        onClick={() => deleteUser(user._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        {/* Posts Table */}
        <section className="mt-10">
          <h2 className="text-xl  text-white mb-5">Manage Posts</h2>
          <div className="rounded-xl overflow-hidden bg-[#10131d] bg-opacity-80 backdrop-blur-md shadow-lg">
            <table className="min-w-full text-gray-200">
              <thead className="bg-[#202437]">
                <tr>
                  <th className="p-3">Posted By</th>
                  <th className="p-3">Body</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post._id} className="transition hover:bg-[#282e45]">
                    <td className="p-3">{post.postedBy?.name || "Unknown"}</td>
                    <td className="p-3 max-w-xl truncate">{post.body}</td>
                    <td className="p-3">
                      <button
                        className="bg-red-500 px-3 py-1 rounded text-white hover:bg-red-600"
                        onClick={() => deletePost(post._id)}
                      >
                        Delete Post
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
