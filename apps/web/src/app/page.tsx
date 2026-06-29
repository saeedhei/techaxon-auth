import { SignedIn } from "../features/auth/components/SignedIn";
import { SignedOut } from "../features/auth/components/SignedOut";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <SignedIn>
        <div className="bg-emerald-100 text-emerald-800 p-8 rounded-2xl shadow-sm text-center">
          <h1 className="text-3xl font-bold mb-2">
            Welcome to TechAxon Dashboard
          </h1>
          <p>You are successfully logged in! Your session is secure.</p>
        </div>
      </SignedIn>

      <SignedOut>
        <div className="bg-white border border-gray-200 text-gray-800 p-8 rounded-2xl shadow-sm text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">TechAxon Core ID</h1>
          <p className="text-gray-500 mb-6">
            You are currently signed out. Please log in to access the system.
          </p>
          <button className="bg-cyan-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-cyan-700 w-full transition-colors">
            Go to Login
          </button>
        </div>
      </SignedOut>
    </main>
  );
}
