"use client";

import React from "react";
import { logError } from "@/lib/logger";
import { getCurrentUser } from "@/app/[locale]/actions/auth";

/**
 * Retrieve the connected wallet address from localStorage.
 * Returns null when unavailable (e.g., during SSR).
 */
function getWalletAddress() {
  if (typeof window !== "undefined") {
    return window.localStorage.getItem("stellar_wallet_address") ?? null;
  }
  return null;
}

/**
 * Internal class component that acts as the actual error catcher.
 * It reports errors via `logError` and displays a friendly UI.
 */
class ErrorCatcher extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  async componentDidCatch(error, errorInfo) {
    // Gather context – user ID and wallet address if available.
    const user = typeof getCurrentUser === "function" ? await getCurrentUser() : null;
    const userId = user?.id ?? null;
    const walletAddress = getWalletAddress();
    logError(error, { userId, walletAddress, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <h2 className="text-2xl font-bold mb-2">Something went wrong.</h2>
          <p className="text-gray-600 mb-4">
            We’re sorry for the inconvenience. Please try refreshing the page or contact support if the problem persists.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Public wrapper that can be used like <ErrorBoundary>{children}</ErrorBoundary>.
 */
export default function ErrorBoundary({ children }) {
  return <ErrorCatcher>{children}</ErrorCatcher>;
}
