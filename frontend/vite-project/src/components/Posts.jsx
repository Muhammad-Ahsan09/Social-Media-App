import { useEffect, useRef, useState } from "react";
import { FaRegHeart } from "react-icons/fa";
import { IoChatbubbleOutline } from "react-icons/io5";
import { TbLocationShare } from "react-icons/tb";
import { Link, useParams } from "react-router-dom";
import { IoIosHeart } from "react-icons/io";
import LazyImage from "./Image"
import PostDetail from "../pages/PostDetail";



const Posts = () => {

    const [posts, setPosts] = useState([])
    const [likedPostsId, setLikedPostsId] = useState([])
    const [viewingPost, setViewingPost] = useState(true)
    const params = useParams()
    
    // let observer = new IntersectionObserver(callback, options)
    
    

    const current_user_id = params.userid

    // console.log(current_user_id)


    useEffect(() => {
        const getPosts = async () => {
           const res =  await fetch("http://localhost:8000/api/posts")
           setPosts(await res.json())
        }
        getPosts()

        
    },[])

    useEffect(() => {
        const getLikedPosts = async () => {
           const res =  await fetch(`http://localhost:8000/api/liked_posts/${current_user_id}`)
           let data = await res.json()

           data = data.map((post) => post.id)
           console.log(data)
           setLikedPostsId(data)
        }
        getLikedPosts()
    },[])

    const handleLikePost = async (postid) => {
        setLikedPostsId([...likedPostsId, postid])
        const res = await fetch(`http://localhost:8000/api/posts/like/${postid}/${current_user_id}`, {
            method: "PATCH"
        })

        const data = await res.json()
        console.log(data)
    }

    const handleUnlikePost = async (postid) => {
        setLikedPostsId(likedPostsId.filter((id) => id != postid))
        await fetch(`http://localhost:8000/api/posts/unlike/${postid}/${current_user_id}`,{
            method: "PATCH"
        })
    }

    const handleComment = async (e, post_id) => {
        // e.preventDefault()
         
        if(e.key === "Enter")
        {
            const comment = e.target.value
            await fetch(`http://localhost:8000/api/comments/${current_user_id}/${post_id}`, {
                method: "POST",
                body: JSON.stringify({comment}),
                headers: {
                    "Content-Type" : "application/json"
                }
            })

            e.target.value = ""
        }
        
        
    }

    

    return <div className="  pl-20 mt-8 mb-52">
        
        {
            
            
            posts.map((post, index) =>  <div className="w-2/3 mb-7" key={index}>
                
                {
                   
                   
                    <div>
                        <Link to={`/profile/${post.user_id}`}>
                            <div className="flex">
                                <img src={`http://localhost:8000/profile-images/${post.profile_pic_url}`} className="rounded-full h-12 w-12 cursor-pointer"/>
                                <div className="ml-4 flex items-center font-semibold ">{post.full_name}</div>
                            </div>
                        </Link>

                        <Link to={`/posts/${post.id}`}>
                            <div className="">
                                <LazyImage src={`http://localhost:8000/post-images/${post.imageUrl}`} alt="" height="75%" />
                            </div>
                        </Link>

                        
                        <div className="mt-4">
                            {
                               
                                likedPostsId.includes(post.id) ?
                                 <button> <IoIosHeart className="w-10 h-8" onClick={() => {handleUnlikePost(post.id)}}/> </button> 
                                 : 
                                 <button onClick={() => {handleLikePost(post.id)}}><FaRegHeart className="w-10 h-7"/></button>
                            }
                            
                            
                            <button><IoChatbubbleOutline className="w-10 h-7"/></button>
                            <button><TbLocationShare className="w-10 h-7" /></button>
                        </div>

                        <div className="font-semibold">
                            {post.likes} Likes
                        </div>

                        <div className="flex">
                            <p className="h-5 overflow-hidden">
                                {post.description}
                            </p>
                            ...
                        </div> 

                        <p className="text-slate-500 mt-4">
                            <Link to={`/posts/${post.id}`}>
                                <button>View all comments</button>
                            </Link>
                        </p>

                            
                        <div>
                            {/* <form> */}
                                <input type="text"  placeholder="Add a comment..." 
                                className="outline-none border-b w-full mt-2 transition-all text-slate-500 dark:bg-black"
                                onKeyDown={(e) => {handleComment(e, post.id)}}
                                />
                                {/* <button type="submit">Submit</button> */}
                            {/* </form> */}
                        </div>
                    </div>
                }
            </div>)
        }
        
    </div>
}

export default Posts;