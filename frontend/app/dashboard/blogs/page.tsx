"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import Navbar from "@/components/Navbar";

export default function MyBlogsPage() {
  const router = useRouter();
  const { token, isAuthenticated, user } = useAuthStore();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/blogs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        useAuthStore.getState().logout();
        router.push("/login");
        return;
      }

      if (!response.ok) throw new Error("Failed to load blogs");

      const data = await response.json();
      setBlogs(data);
    } catch (err) {
      setError("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    try {
      const response = await fetch(`http://localhost:8000/api/blogs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok || response.status === 204) {
        setBlogs(blogs.filter((blog) => blog.id !== id));
      }
    } catch (err) {
      alert("Failed to delete blog");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">Loading your blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Blogs Grid */}
          {blogs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg shadow">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No blogs yet
              </h2>
              <p className="text-gray-600 mb-6">
                Start creating amazing content with AI
              </p>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
              >
                Create Your First Blog
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <div
                  key={blog.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {blog.title || blog.topic}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(blog.created_at)}
                    </p>
                  </div>

                  <div className="text-gray-700 text-sm mb-4 line-clamp-3">
                    <div className="text-gray-700 text-sm mb-4 line-clamp-3">
                      {(() => {
                        try {
                          const parsed =
                            typeof blog.content === "string"
                              ? JSON.parse(blog.content)
                              : blog.content;
                          const text =
                            parsed?.blog?.content ||
                            parsed?.content ||
                            "No preview available.";
                          return text.substring(0, 150) + "...";
                        } catch {
                          return "No preview available.";
                        }
                      })()}
                    </div>{" "}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/dashboard/blogs/${blog.id}`)}
                      className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(blog.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
