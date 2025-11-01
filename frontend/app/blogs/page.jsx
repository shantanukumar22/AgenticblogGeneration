"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Blogspage() {
  const [topic, setTopic] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBlogs = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic before generating.");
      return;
    }
    setLoading(true);
    setError(null);
    console.log("Sending topic:", topic);
    try {
      const response = await fetch("http://localhost:8000/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: topic }),
      });
      if (!response.ok) throw new Error("Failed to fetch blogs");
      const data = await response.json();
      console.log("Response:", data);

      const blogData = data.data?.blog || data.blog || data;
      if (blogData) {
        setBlogs(Array.isArray(blogData) ? blogData : [blogData]);
      } else {
        setError("No blog data found in response.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-gray-100 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-3xl bg-[#1a1a1a] p-6 rounded-xl shadow-lg border border-gray-800">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">
          AI Blog Generator
        </h1>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic (e.g., Introduction to Radiohead)"
            className="flex-1 bg-[#121212] text-gray-200 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none placeholder-gray-500"
          />
          <button
            onClick={fetchBlogs}
            disabled={!topic || loading}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-3 rounded-lg font-medium shadow-md transition-all disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Blog"}
          </button>
        </div>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <div className="space-y-8">
          {blogs.map((blog, index) => (
            <div
              key={index}
              className="bg-[#141414] p-6 rounded-lg border border-gray-800 shadow-md hover:shadow-purple-700/10 transition-all"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
               {blog.title || blog.topic}
              </ReactMarkdown>
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {blog.content || "No content available."}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
