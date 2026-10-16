import { useEffect, useState } from "react";
import LeftSidebar from "../components/LeftSidebar";
import { FaRegHeart, FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import { IoIosHeart } from "react-icons/io";
import { IoChatbubbleOutline } from "react-icons/io5";
import { TbLocationShare } from "react-icons/tb";
import BottomNavbar from "../components/BottomNavbar";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL


const SearchPage = ({ setUser, currentUserId }) => {

    const [search, setSearch] = useState("")
    const [posts, setPosts] = useState([])
    const [likedPostsId, setLikedPostsId] = useState([])
    const [users, setUsers] = useState([])

    useEffect(() => {
        const getLikedPosts = async () => {
            const res = await fetch(`${BACKEND_URL}/api/liked_posts/${currentUserId}`)
            let data = await res.json()

            data = data.map((post) => post.id)
            setLikedPostsId(data)
        }
        getLikedPosts()
    }, [])


    const handleSearch = async () => {
        if (search.length === "") {
            return;
        }
        const res = await fetch(`${BACKEND_URL}/api/search/${search}`)
        const data = await res.json()

        setPosts(data[0])
        setUsers(data[1])
    }

    const handleLikePost = async (postid) => {
        setLikedPostsId([...likedPostsId, postid]);
        await fetch(`${BACKEND_URL}/api/posts/like/${postid}/${currentUserId}`, {
            method: "PATCH"
        });
    };

    const handleUnlikePost = async (postid) => {
        setLikedPostsId(likedPostsId.filter((id) => id != postid));
        await fetch(`${BACKEND_URL}/api/posts/unlike/${postid}/${currentUserId}`, {
            method: "PATCH"
        });
    };



return (
    <>
        <div className="min-h-screen bg-[#E9EFEB] text-[#294C46]
            dark:bg-[#182823] dark:text-[#E1EAE4]
            transition-colors duration-200">

            <div className="flex flex-col md:flex-row">
                <LeftSidebar
                    setUser={setUser}
                    currentUserId={currentUserId}
                />

                <div className="w-full md:w-5/6 min-w-0 p-3 pt-16 md:p-5">

                    {/* Search Bar */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSearch();
                        }}
                        className="flex items-center gap-3
                        sticky top-14 md:top-0 z-10
                        rounded-2xl px-4
                        border border-[#D6DFD9] dark:border-[#344A43]
                        bg-[#F6F7F4] dark:bg-[#20342B]
                        shadow-sm shadow-[#294C46]/5
                        transition-colors duration-200"
                    >
                        <FaSearch className="h-5 w-5 shrink-0
                            text-[#78877F] dark:text-[#9EB1A4]" />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-12 w-full min-w-0 bg-transparent
                            outline-none text-sm
                            text-[#294C46] dark:text-[#E1EAE4]
                            placeholder:text-[#78877F]
                            dark:placeholder:text-[#9EB1A4]"
                            placeholder="Search people and posts..."
                        />

                        <button
                            type="submit"
                            className="shrink-0 rounded-xl px-4 py-2
                            bg-[#397E6D] text-white
                            hover:bg-[#306D5E]
                            dark:bg-[#A9DCC8] dark:text-[#20342B]
                            dark:hover:bg-[#BCE6D5]
                            text-sm font-medium transition-colors"
                        >
                            Search
                        </button>
                    </form>

                    {/* Search Results */}
                    <div className="grid grid-cols-1 lg:grid-cols-2
                        gap-6 lg:gap-8 mt-6 pb-20 md:pb-5">

                        {/* Posts Column */}
                        <section className="min-w-0 lg:border-r
                            lg:border-[#D6DFD9] lg:dark:border-[#344A43]
                            lg:pr-6">

                            <h2 className="text-lg font-semibold mb-5">
                                Posts
                            </h2>

                            {posts.length !== 0 ? (
                                posts.map((post, index) => (
                                    <article
                                        className="w-full md:max-w-[500px]
                                        mb-6 rounded-2xl p-4
                                        bg-[#F6F7F4] dark:bg-[#20342B]
                                        border border-[#D6DFD9]
                                        dark:border-[#344A43]
                                        shadow-sm shadow-[#294C46]/5"
                                        key={post.id ?? index}
                                    >
                                        {/* User Information */}
                                        <Link
                                            to={`/profile/${post.user_id}`}
                                            className="flex items-center gap-3 mb-4"
                                        >
                                            <img
                                                src={post.profile_pic_url}
                                                alt=""
                                                className="h-11 w-11 rounded-full
                                                object-cover ring-2
                                                ring-[#D6DFD9] dark:ring-[#40574C]"
                                            />

                                            <span className="font-semibold text-sm
                                                text-[#294C46] dark:text-[#E1EAE4]">
                                                {post.full_name}
                                            </span>
                                        </Link>

                                        {/* Post Media */}
                                        <Link
                                            to={`/posts/${post.id}`}
                                            className="block overflow-hidden rounded-xl
                                            bg-[#E9EFEB] dark:bg-[#182823]"
                                        >
                                            {post.resource_type === "video" ? (
                                                <video
                                                    src={post.imageUrl}
                                                    controls
                                                    muted
                                                    loop
                                                    playsInline
                                                    className="block w-full max-h-[65vh]
                                                    object-contain"
                                                />
                                            ) : (
                                                <img
                                                    src={post.imageUrl}
                                                    alt={post.description || "Post content"}
                                                    className="mt-0 block w-full max-h-[500px]
                                                    rounded-xl object-contain"
                                                />
                                            )}
                                        </Link>

                                        {/* Post Actions */}
                                        <div className="flex items-center gap-5 mt-4 mb-3">
                                            {likedPostsId.includes(post.id) ? (
                                                <button
                                                    type="button"
                                                    aria-label="Unlike post"
                                                    onClick={() => handleUnlikePost(post.id)}
                                                    className="text-rose-500 hover:scale-110
                                                    transition-transform"
                                                >
                                                    <IoIosHeart className="h-6 w-6" />
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    aria-label="Like post"
                                                    onClick={() => handleLikePost(post.id)}
                                                    className="text-[#536E62] dark:text-[#C4D9CC]
                                                    hover:text-rose-500
                                                    transition-colors"
                                                >
                                                    <FaRegHeart className="h-6 w-6" />
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                aria-label="Comments"
                                                className="text-[#536E62] dark:text-[#C4D9CC]
                                                hover:text-[#397E6D]
                                                dark:hover:text-[#A9DCC8]
                                                transition-colors"
                                            >
                                                <IoChatbubbleOutline className="h-6 w-6" />
                                            </button>

                                            <button
                                                type="button"
                                                aria-label="Share post"
                                                className="text-[#536E62] dark:text-[#C4D9CC]
                                                hover:text-[#397E6D]
                                                dark:hover:text-[#A9DCC8]
                                                transition-colors"
                                            >
                                                <TbLocationShare className="h-6 w-6" />
                                            </button>
                                        </div>

                                        {/* Likes */}
                                        <p className="font-semibold text-sm mb-2">
                                            {post.likes} Likes
                                        </p>

                                        {/* Description */}
                                        <p className="text-sm leading-relaxed
                                            text-[#536E62] dark:text-[#C4D9CC]
                                            break-words line-clamp-3">
                                            {post.description}
                                        </p>

                                        {/* Comments */}
                                        <button
                                            type="button"
                                            className="block text-sm mt-3
                                            text-[#78877F] dark:text-[#9EB1A4]
                                            hover:text-[#397E6D]
                                            dark:hover:text-[#A9DCC8]
                                            transition-colors"
                                        >
                                            View all comments
                                        </button>

                                        <input
                                            type="text"
                                            placeholder="Add a comment..."
                                            className="w-full mt-3 py-2
                                            bg-transparent outline-none
                                            border-b border-[#D6DFD9]
                                            dark:border-[#40574C]
                                            text-sm text-[#294C46]
                                            dark:text-[#E1EAE4]
                                            placeholder:text-[#78877F]
                                            dark:placeholder:text-[#9EB1A4]
                                            focus:border-[#78C9CD]
                                            transition-colors"
                                        />
                                    </article>
                                ))
                            ) : (
                                search.length !== 0 && (
                                    <div className="rounded-2xl p-8 text-center
                                        bg-[#F6F7F4] dark:bg-[#20342B]
                                        border border-[#D6DFD9]
                                        dark:border-[#344A43]">
                                        <FaSearch className="h-7 w-7 mx-auto mb-3
                                            text-[#9BAFA3] dark:text-[#718F7F]" />
                                        <h3 className="font-semibold">
                                            No related posts found
                                        </h3>
                                        <p className="text-sm mt-1
                                            text-[#78877F] dark:text-[#9EB1A4]">
                                            Try searching with different keywords.
                                        </p>
                                    </div>
                                )
                            )}
                        </section>

                        {/* People Column */}
                        <section className="min-w-0">
                            <h2 className="text-lg font-semibold mb-5">
                                People
                            </h2>

                            {users.length !== 0 ? (
                                <div className="rounded-2xl overflow-hidden
                                    bg-[#F6F7F4] dark:bg-[#20342B]
                                    border border-[#D6DFD9]
                                    dark:border-[#344A43]">

                                    {users.map((user) => (
                                        <Link
                                            to={`/profile/${user.id}`}
                                            key={user.id}
                                            className="flex items-center gap-4 p-4
                                            border-b last:border-b-0
                                            border-[#D6DFD9] dark:border-[#344A43]
                                            hover:bg-[#E9EFEB]
                                            dark:hover:bg-[#253A31]
                                            transition-colors"
                                        >
                                            <img
                                                src={user.profile_pic_url}
                                                alt=""
                                                className="w-12 h-12 md:w-14 md:h-14
                                                rounded-full object-cover
                                                ring-2 ring-[#D6DFD9]
                                                dark:ring-[#40574C]"
                                            />

                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-sm
                                                    truncate">
                                                    {user.full_name}
                                                </h3>
                                                <p className="text-xs mt-1
                                                    text-[#78877F] dark:text-[#9EB1A4]">
                                                    View profile
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                search.length !== 0 && (
                                    <div className="rounded-2xl p-8 text-center
                                        bg-[#F6F7F4] dark:bg-[#20342B]
                                        border border-[#D6DFD9]
                                        dark:border-[#344A43]">
                                        <h3 className="font-semibold">
                                            No related users found
                                        </h3>
                                        <p className="text-sm mt-1
                                            text-[#78877F] dark:text-[#9EB1A4]">
                                            Try another name or keyword.
                                        </p>
                                    </div>
                                )
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>

        <BottomNavbar />
    </>
);

}

export default SearchPage;