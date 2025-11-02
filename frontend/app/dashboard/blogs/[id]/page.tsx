"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function BlogDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token, isAuthenticated } = useAuthStore();

  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    fetchBlog();
  }, []);

  const fetchBlog = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/blogs/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to load blog");
      const data = await response.json();

      // Parse nested JSON content
      let parsed;
      try {
        parsed =
          typeof data.content === "string"
            ? JSON.parse(data.content)
            : data.content;
      } catch {
        parsed = { blog: { title: data.title, content: data.content } };
      }

      setBlog({
        title: parsed.blog?.title || data.title || data.topic,
        content: parsed.blog?.content || data.content,
        created_at: data.created_at,
      });
    } catch (err) {
      setError("Failed to load blog");
    } finally {
      setLoading(false);
    }
  };

  // Strip markdown formatting from title
  const cleanTitle = (title: string) => {
    if (!title) return "";
    return title
      .replace(/#+\s*/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
      .trim();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-red-600 text-lg mb-4">
            {error || "Blog not found."}
          </p>
          <button
            onClick={() => router.push("/dashboard/blogs")}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Back to My Blogs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <div className="border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <button
            onClick={() => router.push("/dashboard/blogs")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to My Blogs
          </button>
        </div>
      </div>

      {/* Blog Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <article className="blog-post-container">
          {/* Blog Title - Clean without markdown */}
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {cleanTitle(blog.title)}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200">
            <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-lg">
              AI
            </div>
            <div>
              <p className="font-medium text-gray-900">AI Writer</p>
              <p className="text-sm text-gray-600">
                {new Date(blog.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                · {Math.ceil((blog.content?.length || 0) / 1000)} min read
              </p>
            </div>
          </div>

          {/* Blog Content with Medium-style prose */}
          <div className="medium-prose">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1
                    className="text-3xl font-bold mt-12 mb-6 text-gray-900 leading-tight"
                    {...props}
                  />
                ),
                h2: ({ node, ...props }) => (
                  <h2
                    className="text-2xl font-bold mt-10 mb-5 text-gray-900 leading-tight"
                    {...props}
                  />
                ),
                h3: ({ node, ...props }) => (
                  <h3
                    className="text-xl font-bold mt-8 mb-4 text-gray-900 leading-snug"
                    {...props}
                  />
                ),
                h4: ({ node, ...props }) => (
                  <h4
                    className="text-lg font-bold mt-6 mb-3 text-gray-900"
                    {...props}
                  />
                ),
                p: ({ node, ...props }) => (
                  <p
                    className="text-xl leading-relaxed mb-6 text-gray-800"
                    {...props}
                  />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="space-y-3 mb-6 ml-6 list-disc" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol
                    className="space-y-3 mb-6 ml-6 list-decimal"
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
                    className="border-l-4 border-gray-900 pl-6 py-2 my-8 italic text-xl text-gray-700"
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
                      className="block bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto my-6 text-sm font-mono leading-relaxed"
                      {...props}
                    />
                  ),
                pre: ({ node, ...props }) => <pre className="my-6" {...props} />,
                a: ({ node, ...props }) => (
                  <a
                    className="text-gray-900 underline hover:text-gray-600 transition-colors"
                    {...props}
                  />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-bold text-gray-900" {...props} />
                ),
                em: ({ node, ...props }) => <em className="italic" {...props} />,
                hr: ({ node, ...props }) => (
                  <hr className="my-12 border-t border-gray-200" {...props} />
                ),
                img: ({ node, ...props }) => (
                  <img className="w-full rounded-lg my-8" {...props} />
                ),
              }}
            >
              {blog.content || "No content available."}
            </ReactMarkdown>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex gap-4 mb-8">
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors">
                👏 Clap
              </button>
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors">
                💬 Comment
              </button>
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors">
                🔖 Saved
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/dashboard/blogs")}
                className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium transition-colors"
              >
                View All My Blogs
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Create New Blog
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}