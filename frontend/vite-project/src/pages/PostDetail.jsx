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
        <LeftSidebar setUser={setUser} currentUserId={currentUserId} />

        <main className="mx-auto w-full max-w-[1400px] flex-1 pb-24 pt-16 md:px-6 md:pb-10 md:pt-8 lg:px-8">
          <article className="grid grid-cols-1 overflow-hidden bg-white dark:bg-[#1E3027] md:rounded-xl md:border md:border-[#C3D2C7] md:dark:border-[#34493D] lg:h-[calc(100vh-6rem)] lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">
            {/* Media: full-bleed on mobile, dark stage on desktop */}
            <div className="flex items-center justify-center bg-[#15231C] lg:h-full lg:min-h-0">
              {isVideoFile(post.imageUrl) ? (
                <video
                  src={post.imageUrl}
                  controls
                  muted
                  loop
                  playsInline
                  className="max-h-[70vh] w-full object-contain lg:max-h-full"
                />
              ) : (
                <img
                  src={post.imageUrl}
                  alt={post.description || "Post content"}
                  className="max-h-[70vh] w-full object-contain lg:max-h-full"
                />
              )}
            </div>

            {/* Caption + comments */}
            <div className="flex min-h-0 flex-col border-[#D3DFD6] dark:border-[#34493D] lg:border-l">
              {/* Caption */}
              <div className="px-4 pb-4 pt-5 sm:px-6">
                {post.description ? (
                  <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-[#294C46] dark:text-[#E1EAE4]">
                    {post.description}
                  </p>
                ) : (
                  <p className="text-[15px] text-[#78877F] dark:text-[#9EB1A4]">
                    No description.
                  </p>
                )}

                {Number(currentUserId) === Number(post.user_id) && (
                  <button
                    type="button"
                    onClick={(e) => handleDeletePost(e)}
                    className="-ml-2 mt-3 inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] font-medium text-red-700 transition-colors hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500 dark:text-red-300 dark:hover:bg-red-950/40"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="m19 6-1 14H6L5 6" />
                      <path d="M10 11v5M14 11v5" />
                    </svg>
                    Delete post
                  </button>
                )}
              </div>

              {/* Comments */}
              <div className="flex min-h-0 flex-1 flex-col border-t border-[#D3DFD6] dark:border-[#34493D]">
                <h2 className="px-4 pb-1 pt-4 text-sm font-semibold sm:px-6">
                  {comments.length === 1
                    ? "1 comment"
                    : `${comments.length} comments`}
                </h2>

                <div className="min-h-0 flex-1 px-4 pb-6 pt-3 sm:px-6 lg:overflow-y-auto">
                  {comments.length > 0 ? (
                    <ul className="space-y-5">
                      {comments.map((comment, index) => (
                        <li
                          key={comment.id || index}
                          className="flex items-start gap-3"
                        >
                          <img
                            src={comment.profile_pic_url}
                            alt=""
                            className="h-8 w-8 shrink-0 rounded-full bg-[#E5EDE6] object-cover dark:bg-[#15231C]"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="break-words text-[13px] font-semibold leading-5">
                              {comment.username}
                            </p>
                            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[#43614F] dark:text-[#C4D9CC]">
                              {comment.comment}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="py-6 text-sm leading-6 text-[#78877F] dark:text-[#9EB1A4]">
                      No comments yet. Start the conversation.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </article>
        </main>

        <Toaster />
      </div>
    </div>

    <BottomNavbar />
  </>
);
};

export default PostDetail;
