import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import M from "materialize-css";
import { FaFacebookSquare, LuInstagram } from "react-icons/lu";
import { UserContext } from "../../App";

const SignIn = () => {
  const { dispatch } = useContext(UserContext);
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPass, setShowPass] = useState(false);

  const PostData = () => {
    if (
      !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/.test(
        email
      )
    ) {
      M.toast({ html: "Invalid Email", classes: "red-600" });
      return;
    }
    fetch("/signin", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password,
        email,
      }),
    })
      .then((res) => res.json())
      .then((data) => {

        if (data.error) {
          M.toast({ html: data.error, classes: "red-600" });
        } else {
          localStorage.setItem("jwt", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          dispatch({ type: "USER", payload: data.user });
          M.toast({
            html: "Successfully Signed In",
            classes: "green-100",
          });
          if (data.user.isAdmin) {
            navigate("/admin/dashboard");
          } else {
            navigate("/");
          }
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2d48bc] via-[#f24b99] to-[#fd944b] px-2 py-6">
      <div className="max-w-sm w-full mx-auto">
        <div className="bg-black rounded-xl shadow-lg p-10 flex flex-col items-center">
          {/* Instanza Icon replacing text */}
          <LuInstagram size={70} color="#E1306C" />
          {/* Email Input */}
          <input
            type="text"
            placeholder="Phone number, username or email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded bg-[#222] border border-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          {/* Password Input */}
          <div className="w-full relative mb-4">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded bg-[#222] border border-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              onClick={() => setShowPass(!showPass)}
              tabIndex={-1}
              aria-label={showPass ? "Hide password" : "Show password"}
            >
              {showPass ? (
                <svg width="22" height="22" fill="none" stroke="currentColor">
                  <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                <svg width="22" height="22" fill="none" stroke="currentColor">
                  <path d="M2 2l20 20" />
                  <path d="M17.94 17.94A9.96 9.96 0 0112 20c-5.52 0-10-4.48-10-10" />
                </svg>
              )}
            </button>
          </div>
          {/* Forgotten Password */}
          <div className="w-full text-right mb-4">
            <Link to="/reset" className="text-blue-400 hover:underline text-sm">
              Forgotten password?
            </Link>
          </div>
          {/* Login Button */}
          <button
            onClick={PostData}
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-3 rounded"
          >
            Log In
          </button>
          {/* Divider */}
          <div className="flex items-center justify-center text-gray-400 mt-6 mb-6">
            <div className="border-t border-gray-700 w-full mr-3"></div>
            <span className="text-sm">OR</span>
            <div className="border-t border-gray-700 w-full ml-3"></div>
          </div>
          {/* Facebook Login */}
          <button className="flex items-center justify-center gap-2 text-blue-600 font-semibold hover:text-blue-700 mb-6">
            Log in with Facebook
          </button>
        </div>

        {/* Signup Redirect Box */}
        <div className="bg-black rounded-xl text-center text-gray-300 text-sm p-5 mt-6 max-w-sm mx-auto">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-400 hover:underline font-semibold"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
