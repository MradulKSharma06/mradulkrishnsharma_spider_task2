import Lottie from 'lottie-react';
import brokenRobotAnimation from '../assets/lottie/broken_robot.json';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4">404 - Page Not Found</h1>

      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mb-6">
        <Lottie animationData={brokenRobotAnimation} loop={true} />
      </div>

      <p className="text-gray-400 mb-6 text-lg max-w-md">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>

      <Link
        to="/"
        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 transition rounded text-white font-semibold"
      >
        Go Back Home
      </Link>
    </div>
  );
}
