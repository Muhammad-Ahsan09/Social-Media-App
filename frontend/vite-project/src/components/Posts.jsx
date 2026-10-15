import { useEffect, useState } from "react";
import { FaRegHeart } from "react-icons/fa";
import { IoChatbubbleOutline } from "react-icons/io5";
import { TbLocationShare } from "react-icons/tb";
import { Link, useParams } from "react-router-dom";
import { IoIosHeart } from "react-icons/io";
import LazyImage from "./Image";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const Posts = () => {
    const [posts, setPosts] = useState([]);
    const [likedPostsId, setLikedPostsId] = useState([]);
    const params = useParams();
    
    const current_user_id = params.userid;
    
    useEffect(() => {
        const getPosts = async () => {
           const res = await fetch(BACKEND_URL + "/api/posts");
           setPosts(await res.json());
        }
        getPosts();
    }, []);

    useEffect(() => {
        const getLikedPosts = async () => {
           const res = await fetch(BACKEND_URL + `/api/liked_posts/${current_user_id}`);
           let data = await res.json();
           data = data.map((post) => post.id);
           setLikedPostsId(data);
        }
        getLikedPosts();
    }, [current_user_id]);

    const handleLikePost = async (postid) => {
        setLikedPostsId([...likedPostsId, postid]);
        await fetch(BACKEND_URL + `/api/posts/like/${postid}/${current_user_id}`, {
            method: "PATCH"
        });
    };

    const handleUnlikePost = async (postid) => {
        setLikedPostsId(likedPostsId.filter((id) => id != postid));
        await fetch(BACKEND_URL + `/api/posts/unlike/${postid}/${current_user_id}`, {
            method: "PATCH"
        });
    };

    const handleComment = async (e, post_id) => {
        if (e.key === "Enter") {
            const comment = e.target.value;
            await fetch(BACKEND_URL + `/api/comments/${current_user_id}/${post_id}`, {
                method: "POST",
                body: JSON.stringify({ comment }),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            e.target.value = "";
        }
    };

    // 🎥 Helper function to safely detect video assets
    

    return (
        <div className="mt-8 mb-32 w-full px-4 text-[#294C46] sm:px-6 md:mb-40 md:pl-20 md:pr-8">

            {posts.map((post, index) => (
                <article
                    key={post.id ?? index}
                    className="mb-8 w-full max-w-[620px] overflow-hidden rounded-2xl border border-[#D6DFD9] bg-[#F6F7F4] shadow-[0_8px_30px_-24px_rgba(41,76,70,0.25)] transition-colors duration-300 dark:border-[#344A43] dark:bg-[#1D3028] dark:text-[#E1EAE4] sm:mb-10"
                >

                    {/* Post header */}
                    <div className="flex items-center justify-between px-4 py-4 sm:px-5">
                        <Link
                            to={`/profile/${post.user_id}`}
                            className="group flex min-w-0 items-center gap-3"
                        >
                            <img
                                src={post.profile_pic_url}
                                alt={`${post.full_name}'s profile`}
                                className="h-11 w-11 shrink-0 rounded-full border border-[#D6DFD9] object-cover transition group-hover:border-[#78BFA7] dark:border-[#40574C]"
                            />

                            <div className="min-w-0">
                                <h3 className="truncate text-sm font-semibold text-[#294C46] transition group-hover:text-[#397E6D] dark:text-[#E1EAE4] dark:group-hover:text-[#A9DCC8]">
                                    {post.full_name}
                                </h3>
                                <p className="mt-0.5 text-xs text-[#89968D] dark:text-[#9EB1A4]">
                                    Shared a moment
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* Post media */}
                    <div className="overflow-hidden bg-[#E9EFEB] dark:bg-[#17251F]">
                        {post.resource_type === "video" ? (
                            <video
                                src={post.imageUrl}
                                controls
                                muted
                                loop
                                playsInline
                                className="block max-h-[65vh] w-full object-contain"
                            />
                        ) : (
                            <Link
                                to={`/posts/${post.id}`}
                                className="flex h-[65vh] min-h-[250px] max-h-[600px] w-full items-center justify-center overflow-hidden bg-[#E9EFEB] dark:bg-[#17251F]"
                            >
                                <LazyImage
                                    src={post.imageUrl}
                                    alt={`Post by ${post.full_name}`}
                                    height="100%"
                                />
                            </Link>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 px-3 pt-3 sm:px-4">
                        <button
                            type="button"
                            aria-label={likedPostsId.includes(post.id) ? "Unlike post" : "Like post"}
                            onClick={() =>
                                likedPostsId.includes(post.id)
                                    ? handleUnlikePost(post.id)
                                    : handleLikePost(post.id)
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#E9EFEB] active:scale-90 dark:hover:bg-[#30483B]"
                        >
                            {likedPostsId.includes(post.id) ? (
                                <IoIosHeart className="h-6 w-6 text-[#C96D70]" />
                            ) : (
                                <FaRegHeart className="h-[21px] w-[21px] text-[#536E62] dark:text-[#C4D9CC]" />
                            )}
                        </button>

                        <Link
                            to={`/posts/${post.id}`}
                            aria-label="View comments"
                            className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#E9EFEB] active:scale-90 dark:hover:bg-[#30483B]"
                        >
                            <IoChatbubbleOutline className="h-[21px] w-[21px] text-[#536E62] dark:text-[#C4D9CC]" />
                        </Link>

                        <button
                            type="button"
                            aria-label="Share post"
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: `Post by ${post.full_name}`,
                                        url: `${window.location.origin}/posts/${post.id}`,
                                    }).catch(() => { });
                                } else {
                                    navigator.clipboard?.writeText(
                                        `${window.location.origin}/posts/${post.id}`
                                    );
                                }
                            }}
                            className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#E9EFEB] active:scale-90 dark:hover:bg-[#30483B]"
                        >
                            <TbLocationShare className="h-[21px] w-[21px] text-[#536E62] dark:text-[#C4D9CC]" />
                        </button>
                    </div>

                    {/* Likes */}
                    <div className="px-4 pt-1">
                        <p className="text-[13px] font-semibold text-[#294C46] dark:text-[#E1EAE4]">
                            {post.likes} {post.likes === 1 ? "like" : "likes"}
                        </p>
                    </div>

                    {/* Caption */}
                    <div className="px-4 pb-1 pt-2">
                        <p className="break-words text-[13px] leading-6 text-[#536E62] dark:text-[#C4D9CC]">
                            <Link
                                to={`/profile/${post.user_id}`}
                                className="mr-2 font-semibold text-[#294C46] hover:text-[#397E6D] dark:text-[#E1EAE4] dark:hover:text-[#A9DCC8]"
                            >
                                {post.full_name}
                            </Link>

                            {post.description}
                        </p>
                    </div>

                    {/* Comments link */}
                    <div className="px-4 pb-2 pt-1">
                        <Link
                            to={`/posts/${post.id}`}
                            className="text-xs text-[#89968D] transition hover:text-[#397E6D] dark:text-[#9EB1A4] dark:hover:text-[#A9DCC8]"
                        >
                            View all comments
                        </Link>
                    </div>

                    {/* Add comment */}
                    <div className="mx-4 border-t border-[#DFE6E0] py-3 dark:border-[#344A43]">
                        <input
                            type="text"
                            name={`comment-${post.id}`}
                            aria-label={`Add a comment to ${post.full_name}'s post`}
                            placeholder="Write a little something..."
                            className="w-full bg-transparent text-[13px] text-[#294C46] outline-none placeholder:text-[#9AA69E] focus:placeholder:text-[#78877F] dark:text-[#E1EAE4] dark:placeholder:text-[#83988B]"
                            onKeyDown={(e) => handleComment(e, post.id)}
                        />
                    </div>

                </article>
            ))}

        </div>
    );
};

export default Posts;
