import { useEffect, useState } from "react";
import { FaRegHeart } from "react-icons/fa";
import { IoChatbubbleOutline } from "react-icons/io5";
import { TbLocationShare } from "react-icons/tb";
import { Link, useParams } from "react-router-dom";
import { IoIosHeart } from "react-icons/io";
import LazyImage from "./Image";

const Posts = () => {
    const [posts, setPosts] = useState([]);
    const [likedPostsId, setLikedPostsId] = useState([]);
    const params = useParams();
    
    const current_user_id = params.userid;
    
    useEffect(() => {
        const getPosts = async () => {
           const res = await fetch("https://social-media-app-five-rust.vercel.app/api/posts");
           setPosts(await res.json());
        }
        getPosts();
    }, []);

    useEffect(() => {
        const getLikedPosts = async () => {
           const res = await fetch(`https://social-media-app-five-rust.vercel.app/api/liked_posts/${current_user_id}`);
           let data = await res.json();
           data = data.map((post) => post.id);
           setLikedPostsId(data);
        }
        getLikedPosts();
    }, [current_user_id]);

    const handleLikePost = async (postid) => {
        setLikedPostsId([...likedPostsId, postid]);
        await fetch(`https://social-media-app-five-rust.vercel.app/api/posts/like/${postid}/${current_user_id}`, {
            method: "PATCH"
        });
    };

    const handleUnlikePost = async (postid) => {
        setLikedPostsId(likedPostsId.filter((id) => id != postid));
        await fetch(`https://social-media-app-five-rust.vercel.app/api/posts/unlike/${postid}/${current_user_id}`, {
            method: "PATCH"
        });
    };

    const handleComment = async (e, post_id) => {
        if (e.key === "Enter") {
            const comment = e.target.value;
            await fetch(`https://social-media-app-five-rust.vercel.app/api/comments/${current_user_id}/${post_id}`, {
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
        <div className="md:pl-20 mt-8 mb-52">
            {posts.map((post, index) => (
                <div className="w-full md:w-2/3 mb-7" key={index}>
                    <div>
                        <Link to={`/profile/${post.user_id}`}>
                            <div className="flex">
                                <img src={`${post.profile_pic_url}`} alt="" className="rounded-full h-12 w-12 cursor-pointer" />
                                <div className="ml-4 flex items-center font-semibold">{post.full_name}</div>
                            </div>
                        </Link>

                        {/* Media Display Window */}
                        <div className="mt-3 overflow-hidden rounded-md bg-black flex items-center justify-center max-h-[500px]">
                            {post.resource_type === "video" ? (
                                /* Video Card Presentation Container */
                                <video 
                                    src={post.imageUrl} 
                                    controls 
                                    muted 
                                    loop
                                    playsInline
                                    className="w-full h-auto max-h-[500px] object-contain"
                                />
                            ) : (
                                /* Existing Image Container */
                                <Link to={`/posts/${post.id}`} className="w-full">
                                    <LazyImage src={`${post.imageUrl}`} alt="" height="75%" />
                                </Link>
                            )}
                        </div>
                        
                        <div className="ml-4 mt-4">
                            {likedPostsId.includes(post.id) ? (
                                <button onClick={() => handleUnlikePost(post.id)}> 
                                    <IoIosHeart className="w-10 h-8 text-red-500" /> 
                                </button> 
                            ) : (
                                <button onClick={() => handleLikePost(post.id)}>
                                    <FaRegHeart className="w-10 h-7" />
                                </button>
                            )}
                            
                            <Link to={`/posts/${post.id}`}>
                                <button><IoChatbubbleOutline className="w-10 h-7" /></button>
                            </Link>
                            <button><TbLocationShare className="w-10 h-7" /></button>
                        </div>

                        <div className="ml-4 font-semibold">
                            {post.likes} Likes
                        </div>

                        <div className="ml-4 flex">
                            <p className="h-5 overflow-hidden">
                                {post.description}
                            </p>
                            ...
                        </div> 

                        <p className="ml-3 text-slate-500 mt-4">
                            <Link to={`/posts/${post.id}`}>
                                <button>View all comments</button>
                            </Link>
                        </p>
                            
                        <div>
                            <input 
                                type="text"  
                                placeholder="Add a comment..." 
                                className="pl-3 md:pl-0 outline-none border-b w-full mt-2 transition-all text-slate-500 dark:bg-black"
                                onKeyDown={(e) => handleComment(e, post.id)}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Posts;
