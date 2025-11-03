"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuthStore } from "@/lib/store/authStore";
import Navbar from "@/components/Navbar";

export default function Blogspage() {
  const router = useRouter();
  const { token, isAuthenticated, user } = useAuthStore();
  const [tokenUsage, setTokenUsage] = useState(null);
  const [topic, setTopic] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedBlogId, setSavedBlogId] = useState(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const fetchBlogs = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic before generating.");
      return;
    }

    // Check token limit before generating
    if (isAuthenticated() && tokenUsage && tokenUsage.tokens_used >= 10) {
      setShowLimitModal(true);
      return;
    }

    setLoading(true);
    setError(null);
    setSavedBlogId(null);
    setShowSaveSuccess(false);

    try {
      // If user is authenticated, use the API endpoint that saves automatically
      if (isAuthenticated()) {
        const response = await fetch("http://localhost:8000/api/blogs", {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ topic }),
        });

        if (response.status === 401) {
          setError("Session expired. Please login again.");
          useAuthStore.getState().logout();
          router.push("/login");
          return;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        const savedBlog = await response.json();

        // Check if content is JSON or string
        // Parse nested content safely
        let blogContent;
        try {
          const parsed =
            typeof savedBlog.content === "string"
              ? JSON.parse(savedBlog.content)
              : savedBlog.content;

          // Handle nested structure: { topic, blog: { title, content } }
          if (parsed.blog) {
            blogContent = {
              title: parsed.blog.title || savedBlog.title,
              content: parsed.blog.content || "",
            };
          } else {
            blogContent = {
              title: parsed.title || savedBlog.title,
              content: parsed.content || "",
            };
          }
        } catch (e) {
          console.error("Failed to parse blog content:", e);
          blogContent = {
            title: savedBlog.title,
            content:
              typeof savedBlog.content === "string" ? savedBlog.content : "",
          };
        }

        setSavedBlogId(savedBlog.id);
        setBlogs([blogContent]);
        setShowSaveSuccess(true);
        // Refresh token usage info after generation
        if (isAuthenticated()) {
          try {
            const res = await fetch("http://localhost:8000/api/tokens", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (res.ok) {
              const updatedData = await res.json();
              setTokenUsage(updatedData);
            }
          } catch (err) {
            console.error("Failed to refresh token usage:", err);
          }
        }

        // Hide success message after 5 seconds
        setTimeout(() => setShowSaveSuccess(false), 5000);
      } else {
        // Use legacy endpoint for non-authenticated users (preview only)
        const response = await fetch("http://localhost:8000/blogs", {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ topic: topic }),
        });

        if (!response.ok) throw new Error("Failed to fetch blogs");

        const data = await response.json();
        const blogData = data.data?.blog || data.blog || data.data;

        if (blogData) {
          setBlogs(Array.isArray(blogData) ? blogData : [blogData]);
        } else {
          setError("No blog data found in response.");
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Strip markdown formatting from title
  const cleanTitle = (title) => {
    if (!title) return "";
    return title
      .replace(/#+\s*/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
      .trim();
  };

  useEffect(() => {
    const fetchTokenUsage = async () => {
      if (!isAuthenticated()) return;
      try {
        const response = await fetch("http://localhost:8000/api/tokens", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setTokenUsage(data);
        }
      } catch (err) {
        console.error("Failed to fetch token usage:", err);
      }
    };
    fetchTokenUsage();
  }, [token]);

  return (
    <>
      <Navbar />

      {/* Limit Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fadeIn">
            <button
              onClick={() => setShowLimitModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-orange-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Daily Limit Reached
              </h3>

              <p className="text-gray-600 mb-6">
                You've used all 3 blog generations for today. Your limit will
                reset at{" "}
                <span className="font-medium text-gray-900">
                  {tokenUsage?.reset_at
                    ? new Date(tokenUsage.reset_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "midnight"}
                </span>
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Got it
                </button>
                <button
                  onClick={() => router.push("/dashboard/blogs")}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  View My Blogs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-white px-4 sm:px-6 lg:px-8">
        {/* Header Section - Centered and Minimal */}
        <div className="border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4 pt-10 text-center">
              Write Better, Faster
            </h1>
            <p className="text-xl text-gray-600 text-center mb-12">
              AI-powered blog posts in seconds
            </p>

            {/* Login Notice for Non-authenticated Users */}
            {!isAuthenticated() && (
              <div className="mb-8 text-center">
                <p className="text-gray-600">
                  <button
                    onClick={() => router.push("/login")}
                    className="text-gray-900 underline hover:text-gray-700 font-medium"
                  >
                    Sign in
                  </button>{" "}
                  to save your blogs
                </p>
              </div>
            )}

            {/* Minimal Token Usage Indicator */}
            {isAuthenticated() && tokenUsage && (
              <div className="mb-8 flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i <= tokenUsage.tokens_used
                            ? "bg-gray-900"
                            : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {tokenUsage.tokens_used}/5 today
                  </span>
                </div>
              </div>
            )}

            {/* Success Message */}
            {showSaveSuccess && savedBlogId && (
              <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg
                      className="h-5 w-5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-green-800 text-sm font-medium">
                      Saved successfully
                    </span>
                  </div>
                  <button
                    onClick={() => router.push("/dashboard/blogs")}
                    className="text-sm text-green-700 underline hover:text-green-800"
                  >
                    View all
                  </button>
                </div>
              </div>
            )}

            {/* Input Section - Centered */}
            <div>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="What would you like to write about?"
                  className="flex-1 bg-white text-gray-900 border border-gray-300 rounded-lg px-4 sm:px-5 py-3 sm:py-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none placeholder-gray-400 text-base sm:text-lg w-full"
                  onKeyPress={(e) => e.key === "Enter" && fetchBlogs()}
                />
                <button
                  onClick={fetchBlogs}
                  disabled={!topic || loading}
                  className="w-full sm:w-auto bg-gray-900 text-white hover:bg-gray-800 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-900 whitespace-nowrap"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Writing...
                    </span>
                  ) : (
                    "Generate"
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-4 text-red-600 text-sm text-center">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Blog Content Section - Better Spacing */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 sm:py-32 px-4 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mb-6"></div>
              <p className="text-gray-600 text-lg">
                Crafting your blog post
                {isAuthenticated() ? " and saving it" : ""}...
              </p>
            </div>
          )}

          {!loading && blogs.length > 0 && (
            <div className="py-16">
              {blogs.map((blog, index) => (
                <article key={index} className="blog-post-container">
                  {/* Blog Title */}
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight tracking-tight">
                    {cleanTitle(blog.title || blog.topic)}
                  </h1>

                  {/* Meta Info - Minimal */}
                  <div className="flex items-center gap-4 mb-12 pb-8 border-b border-gray-200">
                    <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-medium">
                      AI
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">AI Writer</p>
                      <p className="text-sm text-gray-500">
                        {new Date().toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        · {Math.ceil((blog.content?.length || 0) / 1000)} min
                        read
                      </p>
                    </div>
                  </div>

                  {/* Blog Content */}
                  <div className="medium-prose">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ node, ...props }) => (
                          <h1
                            className="text-4xl font-bold mt-16 mb-6 text-gray-900 leading-tight"
                            {...props}
                          />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2
                            className="text-3xl font-bold mt-12 mb-5 text-gray-900 leading-tight"
                            {...props}
                          />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3
                            className="text-2xl font-bold mt-10 mb-4 text-gray-900 leading-snug"
                            {...props}
                          />
                        ),
                        h4: ({ node, ...props }) => (
                          <h4
                            className="text-xl font-bold mt-8 mb-3 text-gray-900"
                            {...props}
                          />
                        ),
                        p: ({ node, ...props }) => (
                          <p
                            className="text-xl leading-relaxed mb-8 text-gray-800"
                            {...props}
                          />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul
                            className="space-y-4 mb-8 ml-6 list-disc"
                            {...props}
                          />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol
                            className="space-y-4 mb-8 ml-6 list-decimal"
                            {...props}
                          />
                        ),
                        li: ({ node, ...props }) => (
                          <li
                            className="text-xl leading-relaxed text-gray-800 pl-2"
                            {...props}
                          />
                        ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote
                            className="border-l-4 border-gray-900 pl-6 py-3 my-10 italic text-xl text-gray-700"
                            {...props}
                          />
                        ),
                        code: ({ node, inline, ...props }) =>
                          inline ? (
                            <code
                              className="bg-gray-100 text-gray-900 px-2 py-1 rounded text-base font-mono"
                              {...props}
                            />
                          ) : (
                            <code
                              className="block bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto my-8 text-sm font-mono leading-relaxed"
                              {...props}
                            />
                          ),
                        pre: ({ node, ...props }) => (
                          <pre className="my-8" {...props} />
                        ),
                        a: ({ node, ...props }) => (
                          <a
                            className="text-gray-900 underline hover:text-gray-600 transition-colors"
                            {...props}
                          />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong
                            className="font-bold text-gray-900"
                            {...props}
                          />
                        ),
                        em: ({ node, ...props }) => (
                          <em className="italic" {...props} />
                        ),
                        hr: ({ node, ...props }) => (
                          <hr
                            className="my-16 border-t border-gray-200"
                            {...props}
                          />
                        ),
                        img: ({ node, ...props }) => (
                          <img className="w-full rounded-lg my-10" {...props} />
                        ),
                      }}
                    >
                      {blog.content || "No content available."}
                    </ReactMarkdown>
                  </div>

                  {/* Footer - Minimal */}
                  <div className="mt-16 pt-8 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                      <button className="px-4 sm:px-5 py-2 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-colors">
                        👏 Clap
                      </button>
                      {savedBlogId ? (
                        <button
                          onClick={() => router.push("/dashboard/blogs")}
                          className="px-4 sm:px-5 py-2 text-xs sm:text-sm bg-green-50 text-green-700 rounded-full font-medium"
                        >
                          ✓ Saved
                        </button>
                      ) : !isAuthenticated() ? (
                        <button
                          onClick={() => router.push("/login")}
                          className="px-4 sm:px-5 py-2 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-colors"
                        >
                          Sign in to Save
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Empty State */}
          {blogs.length === 0 && !loading && (
            <div className="text-center py-20 sm:py-32 px-4">
              <div className="text-7xl mb-6">✍️</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Ready to start writing?
              </h2>
              <p className="text-gray-600 text-lg">
                Enter a topic above to generate your first blog post
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
