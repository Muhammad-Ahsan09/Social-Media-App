
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LeftSidebar from "../components/LeftSidebar";
import BottomNavbar from "../components/BottomNavbar";
import TopNavbar from "../components/TopNavbar";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const cardCorners = [
  "rounded-[26px_26px_26px_12px]",
  "rounded-[20px_28px_14px_28px]",
  "rounded-[28px_16px_28px_28px]",
  "rounded-[16px_28px_24px_28px]",
  "rounded-[28px_24px_16px_28px]",
];

const Explore = ({ setUser, currentUserId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const getPosts = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${BACKEND_URL}/api/posts`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Unable to load posts.");
        }

        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Something went wrong while loading posts.");
          console.error("Explore posts error:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    getPosts();

    return () => controller.abort();
  }, []);

  return (
    <>
      <TopNavbar />

      <div className="flex min-h-screen flex-col bg-[#F7F8F5] pt-14 text-[#294C46] transition-colors dark:bg-gray-950 dark:text-gray-100 md:flex-row md:pt-0">
        <LeftSidebar
          setUser={setUser}
          currentUserId={currentUserId}
        />

        <main className="min-w-0 flex-1 px-3 pb-24 pt-5 sm:px-5 md:px-7 md:pb-8 md:pt-8 lg:px-9">
          {/* Page heading */}
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#82978C]">
                A little inspiration
              </p>

              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Explore
              </h1>

              <p className="mt-2 max-w-md text-sm leading-6 text-[#75877E] dark:text-gray-400">
                Discover the moments, people, and stories that make
                life meaningful.
              </p>
            </div>

            <div className="mb-1 hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E8EEE7] text-[#42675A] dark:bg-gray-800 dark:text-[#B4D0BE] sm:flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3v3" />
                <path d="M12 18v3" />
                <path d="M3 12h3" />
                <path d="M18 12h3" />
                <path d="m5.64 5.64 2.12 2.12" />
                <path d="m16.24 16.24 2.12 2.12" />
                <path d="m18.36 5.64-2.12 2.12" />
                <path d="m7.76 16.24-2.12 2.12" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </div>
          </div>

          {/* Masonry feed */}
          {loading ? (
            <div
              className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4 xl:columns-5"
              aria-label="Loading posts"
            >
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="mb-3 break-inside-avoid animate-pulse sm:mb-4"
                >
                  <div
                    className={`w-full bg-[#E7EBE5] dark:bg-gray-800 ${
                      index % 3 === 0
                        ? "h-64"
                        : index % 3 === 1
                        ? "h-44"
                        : "h-52"
                    } rounded-[24px]`}
                  />
                  <div className="mt-3 h-3 w-2/3 rounded-full bg-[#E7EBE5] dark:bg-gray-800" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-[28px] border border-[#E2E8E0] bg-white px-5 text-center dark:border-gray-800 dark:bg-gray-900">
              <p className="text-sm text-[#75877E] dark:text-gray-300">
                {error}
              </p>

              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-full bg-[#294C46] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#38675C] dark:bg-[#A7C6B4] dark:text-gray-900"
              >
                Try again
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-[28px] border border-dashed border-[#D8E1D6] px-5 text-center dark:border-gray-700">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8EEE7] text-[#42675A] dark:bg-gray-800 dark:text-[#B4D0BE]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
              </div>

              <h2 className="text-lg font-medium">
                Nothing to discover yet
              </h2>

              <p className="mt-2 max-w-sm text-sm text-[#75877E] dark:text-gray-400">
                New posts will appear here as your community shares
                their stories.
              </p>
            </div>
          ) : (
            <div className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4 lg:gap-5 xl:columns-5">
              {posts.map((post, index) => (
                <article
                  key={post.id ?? post._id}
                  className="group mb-4 break-inside-avoid sm:mb-5"
                >
                  <Link
                    to={`/posts/${post.id ?? post._id}`}
                    aria-label={`View post ${index + 1}`}
                    className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#719987] focus-visible:ring-offset-4 dark:focus-visible:ring-offset-gray-950"
                  >
                    <div
                      className={`relative isolate overflow-hidden bg-[#E9EDE7] dark:bg-gray-800 ${
                        cardCorners[index % cardCorners.length]
                      }`}
                    >
                      {post.resource_type === "video" ? (
                        <video
                          src={post.imageUrl}
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          // controls
                          aria-label="Explore video"
                          className="block h-auto max-h-[520px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                        />
                      ) : (
                        <img
                          src={post.imageUrl}
                          alt={post.caption || "Explore community post"}
                          loading="lazy"
                          className="block h-auto max-h-[560px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                        />
                      )}

                      {/* Soft hover treatment */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      {post.resource_type === "video" && (
                        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="m8 5 12 7-12 7z" />
                          </svg>
                        </span>
                      )}
                    </div>

                    {/* Caption and author, when supplied by the API */}
                    {post.caption && (
                      <p className="mt-2 px-1 text-sm font-medium leading-5 text-[#354F45] dark:text-gray-200">
                        {post.caption}
                      </p>
                    )}
                  </Link>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>

      <BottomNavbar currentUserId={currentUserId} />
    </>
  );
};

export default Explore;
