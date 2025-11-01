// "use client";
// import { useState } from "react";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";

// export default function Blogspage() {
//   const [topic, setTopic] = useState("");
//   const [blogs, setBlogs] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const fetchBlogs = async () => {
//     if (!topic.trim()) {
//       setError("Please enter a topic before generating.");
//       return;
//     }
//     setLoading(true);
//     setError(null);
//     console.log("Sending topic:", topic);
//     try {
//       const response = await fetch("http://localhost:8000/blogs", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ topic: topic }),
//       });
//       if (!response.ok) throw new Error("Failed to fetch blogs");
//       const data = await response.json();
//       console.log("Response:", data);

//       const blogData = data.data?.blog || data.blog || data;
//       if (blogData) {
//         setBlogs(Array.isArray(blogData) ? blogData : [blogData]);
//       } else {
//         setError("No blog data found in response.");
//       }
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Strip markdown formatting from title
//   const cleanTitle = (title) => {
//     if (!title) return "";
//     return title
//       .replace(/#+\s*/g, "") // Remove # symbols
//       .replace(/\*\*/g, "") // Remove ** bold markers
//       .replace(/\*/g, "") // Remove * italic markers
//       .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Remove links but keep text
//       .trim();
//   };

//   return (
//     <div className="min-h-screen bg-white">
//       <div className="bg-white border-b border-gray-200">
//         <div className="max-w-4xl mx-auto px-6 py-16">
//           <h1 className="text-5xl font-bold mb-4 text-gray-900">
//             AI Blog Generator
//           </h1>
//           <p className="text-gray-600 mb-10 text-lg">
//             Generate professional blog posts on any topic in seconds
//           </p>

//           <div className="max-w-2xl">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               What would you like to write about?
//             </label>
//             <div className="flex flex-col sm:flex-row gap-3">
//               <input
//                 type="text"
//                 value={topic}
//                 onChange={(e) => setTopic(e.target.value)}
//                 placeholder="e.g., Introduction to Radiohead, Machine Learning Basics..."
//                 className="flex-1 bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none placeholder-gray-400"
//                 onKeyPress={(e) => e.key === "Enter" && fetchBlogs()}
//               />
//               <button
//                 onClick={fetchBlogs}
//                 disabled={!topic || loading}
//                 className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-900 whitespace-nowrap"
//               >
//                 {loading ? "Generating..." : "Generate"}
//               </button>
//             </div>

//             {error && (
//               <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
//                 {error}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="max-w-3xl mx-auto px-6 py-12">
//         {loading && (
//           <div className="flex items-center justify-center py-20">
//             <div className="text-center">
//               <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
//               <p className="text-gray-600">Crafting your blog post...</p>
//             </div>
//           </div>
//         )}

//         <div className="space-y-16">
//           {blogs.map((blog, index) => (
//             <article key={index} className="blog-post-container">
//               <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
//                 {cleanTitle(blog.title || blog.topic)}
//               </h1>

//               <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200">
//                 <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-lg">
//                   AI
//                 </div>
//                 <div>
//                   <p className="font-medium text-gray-900">AI Writer</p>
//                   <p className="text-sm text-gray-600">
//                     {new Date().toLocaleDateString("en-US", {
//                       year: "numeric",
//                       month: "long",
//                       day: "numeric",
//                     })}{" "}
//                     · {Math.ceil((blog.content?.length || 0) / 1000)} min read
//                   </p>
//                 </div>
//               </div>

//               <div className="medium-prose">
//                 <ReactMarkdown
//                   remarkPlugins={[remarkGfm]}
//                   components={{
//                     h1: ({ node, ...props }) => (
//                       <h1
//                         className="text-3xl font-bold mt-12 mb-6 text-gray-900 leading-tight"
//                         {...props}
//                       />
//                     ),
//                     h2: ({ node, ...props }) => (
//                       <h2
//                         className="text-2xl font-bold mt-10 mb-5 text-gray-900 leading-tight"
//                         {...props}
//                       />
//                     ),
//                     h3: ({ node, ...props }) => (
//                       <h3
//                         className="text-xl font-bold mt-8 mb-4 text-gray-900 leading-snug"
//                         {...props}
//                       />
//                     ),
//                     h4: ({ node, ...props }) => (
//                       <h4
//                         className="text-lg font-bold mt-6 mb-3 text-gray-900"
//                         {...props}
//                       />
//                     ),
//                     p: ({ node, ...props }) => (
//                       <p
//                         className="text-xl leading-relaxed mb-6 text-gray-800"
//                         {...props}
//                       />
//                     ),
//                     ul: ({ node, ...props }) => (
//                       <ul
//                         className="space-y-3 mb-6 ml-6 list-disc"
//                         {...props}
//                       />
//                     ),
//                     ol: ({ node, ...props }) => (
//                       <ol
//                         className="space-y-3 mb-6 ml-6 list-decimal"
//                         {...props}
//                       />
//                     ),
//                     li: ({ node, ...props }) => (
//                       <li
//                         className="text-xl leading-relaxed text-gray-800 pl-2"
//                         {...props}
//                       />
//                     ),
//                     blockquote: ({ node, ...props }) => (
//                       <blockquote
//                         className="border-l-4 border-gray-900 pl-6 py-2 my-8 italic text-xl text-gray-700"
//                         {...props}
//                       />
//                     ),
//                     code: ({ node, inline, ...props }) =>
//                       inline ? (
//                         <code
//                           className="bg-gray-100 text-gray-900 px-2 py-1 rounded text-base font-mono"
//                           {...props}
//                         />
//                       ) : (
//                         <code
//                           className="block bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto my-6 text-sm font-mono leading-relaxed"
//                           {...props}
//                         />
//                       ),
//                     pre: ({ node, ...props }) => (
//                       <pre className="my-6" {...props} />
//                     ),
//                     a: ({ node, ...props }) => (
//                       <a
//                         className="text-gray-900 underline hover:text-gray-600 transition-colors"
//                         {...props}
//                       />
//                     ),
//                     strong: ({ node, ...props }) => (
//                       <strong className="font-bold text-gray-900" {...props} />
//                     ),
//                     em: ({ node, ...props }) => (
//                       <em className="italic" {...props} />
//                     ),
//                     hr: ({ node, ...props }) => (
//                       <hr
//                         className="my-12 border-t border-gray-200"
//                         {...props}
//                       />
//                     ),
//                     img: ({ node, ...props }) => (
//                       <img className="w-full rounded-lg my-8" {...props} />
//                     ),
//                   }}
//                 >
//                   {blog.content || "No content available."}
//                 </ReactMarkdown>
//               </div>

//               <div className="mt-12 pt-8 border-t border-gray-200">
//                 <div className="flex gap-4">
//                   <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors">
//                     👏 Clap
//                   </button>
//                   <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors">
//                     💬 Comment
//                   </button>
//                   <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors">
//                     🔖 Save
//                   </button>
//                 </div>
//               </div>
//             </article>
//           ))}
//         </div>

//         {blogs.length === 0 && !loading && (
//           <div className="text-center py-20">
//             <div className="text-6xl mb-4">✍️</div>
//             <h2 className="text-2xl font-bold text-gray-900 mb-2">
//               Ready to create something amazing?
//             </h2>
//             <p className="text-gray-600">
//               Enter a topic above and let AI craft a professional blog post for
//               you.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

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

  // Strip markdown formatting from title
  const cleanTitle = (title) => {
    if (!title) return "";
    return title
      .replace(/#+\s*/g, "") // Remove # symbols
      .replace(/\*\*/g, "") // Remove ** bold markers
      .replace(/\*/g, "") // Remove * italic markers
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Remove links but keep text
      .trim();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Input Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">
            AI Blog Generator
          </h1>
          <p className="text-gray-600 mb-10 text-lg">
            Generate professional blog posts on any topic in seconds
          </p>

          <div className="max-w-2xl">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What would you like to write about?
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Introduction to Radiohead, Machine Learning Basics..."
                className="flex-1 bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none placeholder-gray-400"
                onKeyPress={(e) => e.key === "Enter" && fetchBlogs()}
              />
              <button
                onClick={fetchBlogs}
                disabled={!topic || loading}
                className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-900 whitespace-nowrap"
              >
                {loading ? "Generating..." : "Generate"}
              </button>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Blog Content Section */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
              <p className="text-gray-600">Crafting your blog post...</p>
            </div>
          </div>
        )}

        <div className="space-y-16">
          {blogs.map((blog, index) => (
            <article key={index} className="blog-post-container">
              {/* Blog Title - Clean without markdown */}
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                {cleanTitle(blog.title || blog.topic)}
              </h1>

              {/* Meta Info */}
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200">
                <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-lg">
                  AI
                </div>
                <div>
                  <p className="font-medium text-gray-900">AI Writer</p>
                  <p className="text-sm text-gray-600">
                    {new Date().toLocaleDateString("en-US", {
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
                      <ul
                        className="space-y-3 mb-6 ml-6 list-disc"
                        {...props}
                      />
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
                    pre: ({ node, ...props }) => (
                      <pre className="my-6" {...props} />
                    ),
                    a: ({ node, ...props }) => (
                      <a
                        className="text-gray-900 underline hover:text-gray-600 transition-colors"
                        {...props}
                      />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong className="font-bold text-gray-900" {...props} />
                    ),
                    em: ({ node, ...props }) => (
                      <em className="italic" {...props} />
                    ),
                    hr: ({ node, ...props }) => (
                      <hr
                        className="my-12 border-t border-gray-200"
                        {...props}
                      />
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
                <div className="flex gap-4">
                  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors">
                    👏 Clap
                  </button>
                  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors">
                    💬 Comment
                  </button>
                  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors">
                    🔖 Save
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {blogs.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">✍️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Ready to create something amazing?
            </h2>
            <p className="text-gray-600">
              Enter a topic above and let AI craft a professional blog post for
              you.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
