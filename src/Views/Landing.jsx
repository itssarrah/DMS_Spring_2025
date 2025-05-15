import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function LandingPage() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="flex justify-between items-center p-8  min-h-screen">
      {/* Left Side: Logo, Detailed Text, Header, Features, Buttons */}
      <div className="w-1/2">
        <div className="mb-6">
          <img
            src="logo.jpg"
            alt="DocMedia Logo"
            className="w-[9rem] h-[7rem] mb-4 object-cover"
          />
        </div>
        <h1 className="text-6xl font-extrabold text-primary mb-6">
          Welcome to DocMedia
        </h1>

        <p className="text-3xl text-secondary mb-8 max-w-2xl">
          A modern document management platform designed to streamline your
          workflow. DocMedia empowers individuals and teams to organize, share,
          and collaborate on documents efficiently, all while maintaining high
          levels of security.
        </p>

        <div className="flex space-x-4">
          <Link to="/signup">
            <button className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition duration-300">
              Sign Up
            </button>
          </Link>
          <Link to="/login">
            <button className="px-6 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-teal-700 transition duration-300">
              Log In
            </button>
          </Link>
        </div>
      </div>

      {/* Right Side: Single Image */}
      <div className="w-1/2 flex justify-center items-center">
        <img
          src="landing.png"
          alt="Landing Image"
          className="w-full h-[800px] object-fit rounded-lg"
        />
      </div>
    </div>
  );
}
