import { useEffect, useState } from "react";
import LeftSidebar from "../components/LeftSidebar";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import TopNavbar from "../components/TopNavbar";
import BottomNavbar from "../components/BottomNavbar";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const PostDetail = ({ setUser, currentUserId }) => {
  const params = useParams();
  const navigate = useNavigate();
  const post_id = params.post_id;

  const [post, setPost] = useState({});
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const getPost = async () => {
      const res = await fetch(
        BACKEND_URL + `/api/posts/${post_id}`
      );
      const data = await res.json();
      setPost(data);
    };
    getPost();
  }, [post_id]);

  useEffect(() => {
    const getComments = async () => {
      const res = await fetch(
        BACKEND_URL + `/api/comments/${post_id}`
      );
      const data = await res.json();
      setComments(data);
    };
    getComments();
  }, [post_id]);

  const handleDeletePost = async (e) => {
    const res = await fetch(
      BACKEND_URL + `/api/posts/${post_id}`,
      { method: "DELETE" }
    );
    const data = await res.json();
    if (res.ok) {
      toast.success("Post deleted successfully");
      setTimeout(() => {
        navigate(`/${currentUserId}`);
      }, 500);
    }
  };

  // 🎥 Helper function to safely detect video assets
  const isVideoFile = (url) => {
    if (!url) return false;
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".m3u8"];
    const hasVideoExtension = videoExtensions.some((ext) =>
      url.toLowerCase().endsWith(ext)
    );
    const hasVideoPath = url.toLowerCase().includes("/video/upload/");
    return hasVideoExtension || hasVideoPath;
  };


return (
  <>
    <TopNavbar />

    <div className="min-h-screen bg-[#DDE7DF] text-[#294C46] transition-colors duration-200 dark:bg-[#14241D] dark:text-[#E1EAE4]">
      <div className="flex flex-col md:flex-row">
        <LeftSidebar
          setUser={setUser}
          currentUserId={currentUserId}
        />

        <main className="mx-auto w-full max-w-[1600px] flex-1 px-3 pb-24 pt-20 md:px-6 md:pb-10 md:pt-8 lg:px-8">
          {/* Page heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Post
            </h1>
            <p className="mt-1 text-sm text-[#78877F] dark:text-[#9EB1A4]">
              Take a closer look and join the conversation.
            </p>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.85fr)]">
            {/* Media and description */}
            <section className="min-w-0 overflow-hidden rounded-2xl border border-[#CBD8CE] bg-white shadow-sm shadow-[#294C46]/5 dark:border-[#40574C] dark:bg-[#263B30]">
              {/* Media */}
              <div className="flex min-h-[280px] items-center justify-center bg-[#E5EDE6] p-2 sm:min-h-[400px] sm:p-5 dark:bg-[#1B2D23]">
                {isVideoFile(post.imageUrl) ? (
                  <video
                    src={post.imageUrl}
                    controls
                    muted
                    loop
                    playsInline
                    className="max-h-[75vh] w-full rounded-xl object-contain"
                  />
                ) : (
                  <img
                    src={post.imageUrl}
                    alt={post.description || "Post content"}
                    className="max-h-[75vh] w-full rounded-xl object-contain"
                  />
                )}
              </div>

              {/* Description */}
              <div className="p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-6 w-1 rounded-full bg-[#397E6D]" />
                  <h2 className="text-lg font-semibold">
                    Description
                  </h2>
                </div>

                {post.description ? (
                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#536E62] dark:text-[#C4D9CC]">
                    {post.description}
                  </p>
                ) : (
                  <p className="text-sm italic text-[#78877F] dark:text-[#9EB1A4]">
                    No description provided.
                  </p>
                )}

                {/* Delete action */}
                {Number(currentUserId) === Number(post.user_id) && (
                  <div className="mt-6 border-t border-[#CBD8CE] pt-5 dark:border-[#40574C]">
                    <button
                      type="button"
                      onClick={(e) => handleDeletePost(e)}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:border-red-300 hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/60"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="m19 6-1 14H6L5 6" />
                        <path d="M10 11v5M14 11v5" />
                      </svg>
                      Delete post
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Comments */}
            <section className="flex min-h-[350px] min-w-0 flex-col overflow-hidden rounded-2xl border border-[#CBD8CE] bg-white shadow-sm shadow-[#294C46]/5 dark:border-[#40574C] dark:bg-[#263B30] xl:sticky xl:top-6">
              {/* Comments heading */}
              <div className="border-b border-[#CBD8CE] px-5 py-5 dark:border-[#40574C]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Conversation
                    </h2>
                    <p className="mt-1 text-sm text-[#78877F] dark:text-[#9EB1A4]">
                      Thoughts and replies
                    </p>
                  </div>

                  <span className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-[#E5EDE6] px-3 text-sm font-semibold text-[#397E6D] dark:bg-[#1B2D23] dark:text-[#A9DCC8]">
                    {comments.length}
                  </span>
                </div>
              </div>

              {/* Comment list */}
              <div className="flex-1 divide-y divide-[#E5EDE6] px-5 dark:divide-[#344A43]">
                {comments.length > 0 ? (
                  comments.map((comment, index) => (
                    <div
                      key={comment.id || index}
                      className="flex items-start gap-3 py-5"
                    >
                      <img
                        src={comment.profile_pic_url}
                        alt={comment.username || "User avatar"}
                        className="h-10 w-10 shrink-0 rounded-full border border-[#CBD8CE] bg-[#E5EDE6] object-cover dark:border-[#40574C] dark:bg-[#1B2D23]"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="mb-1 break-words text-sm font-semibold text-[#294C46] dark:text-[#E1EAE4]">
                          {comment.username}
                        </p>
                        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[#536E62] dark:text-[#C4D9CC]">
                          {comment.comment}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex min-h-[260px] flex-col items-center justify-center px-4 py-12 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E5EDE6] text-[#397E6D] dark:bg-[#1B2D23] dark:text-[#A9DCC8]">
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
                      >
                        <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
                      </svg>
                    </div>

                    <h3 className="font-semibold">
                      It’s quiet here
                    </h3>
                    <p className="mt-2 max-w-xs text-sm leading-6 text-[#78877F] dark:text-[#9EB1A4]">
                      No comments yet. Be the first to share a thought.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>

        <Toaster />
      </div>
    </div>

    <BottomNavbar />
  </>
);

};

export default PostDetail;
