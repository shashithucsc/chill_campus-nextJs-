"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function MessageBox({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded shadow-lg flex items-center space-x-3
      ${
        type === "success"
          ? "bg-green-100 border border-green-400 text-green-800"
          : "bg-red-100 border border-red-400 text-red-800"
      }`}
    >
      <span className="font-semibold">{type === "success" ? "Success!" : "Error!"}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-4 px-2 py-1 rounded bg-transparent text-lg font-bold text-gray-700 hover:text-gray-900 focus:outline-none"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    university: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessageType("error");
        setMessage(data.error || "Signup failed");
        return;
      }

      setMessageType("success");
      setMessage("Signup successful! Redirecting to login...");
      setTimeout(() => {
        setMessage(null);
        router.push("/auth/login");
      }, 1800);
    } catch (err) {
      console.error(err);
      setMessageType("error");
      setMessage("An unexpected error occurred.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {message && (
        <MessageBox message={message} type={messageType} onClose={() => setMessage(null)} />
      )}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-900">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-900"
              >
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-900 rounded-md shadow-sm placeholder-gray-900 text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-900 rounded-md shadow-sm placeholder-gray-900 text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="university"
                className="block text-sm font-medium text-gray-900"
              >
                University
              </label>
              <div className="mt-1">
                <select
                  id="university"
                  name="university"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-900 rounded-md shadow-sm placeholder-gray-900 text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.university}
                  onChange={(e) =>
                    setFormData({ ...formData, university: e.target.value })
                  }
                >
                  <option value="">-- Select University --</option>
                  <option value="UCSC">
                    University of Colombo School of Computing (UCSC)
                  </option>
                  <option value="UoM">University of Moratuwa</option>
                  <option value="UoP">University of Peradeniya</option>
                  <option value="UoK">University of Kelaniya</option>
                  <option value="UoJ">University of Jaffna</option>
                  <option value="UoR">University of Ruhuna</option>
                  <option value="UoSJP">University of Sri Jayewardenepura</option>
                  <option value="UoV">University of Visual and Performing Arts</option>
                  <option value="OUSL">The Open University of Sri Lanka</option>
                  <option value="EUSL">Eastern University, Sri Lanka</option>
                  <option value="SUSL">Sabaragamuwa University of Sri Lanka</option>
                  <option value="WUSL">Wayamba University of Sri Lanka</option>
                  <option value="RUSL">Rajarata University of Sri Lanka</option>
                  <option value="SEUSL">South Eastern University of Sri Lanka</option>
                  <option value="UWU">Uva Wellassa University</option>
                  <option value="NSBM">NSBM Green University</option>
                  <option value="SLIIT">Sri Lanka Institute of Information Technology (SLIIT)</option>
                  <option value="CINEC">CINEC Campus</option>
                  <option value="ICBT">ICBT Campus</option>
                  <option value="APIIT">APIIT Sri Lanka</option>
                  <option value="ACBT">Australian College of Business and Technology (ACBT)</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-900"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-900 rounded-md shadow-sm placeholder-gray-900 text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-900"
              >
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-900 rounded-md shadow-sm placeholder-gray-900 text-black focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
