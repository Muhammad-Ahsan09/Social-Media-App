import { useEffect, useState } from "react";
import LeftSidebar from "../components/LeftSidebar";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import TopNavbar from "../components/TopNavbar";
import BottomNavbar from "../components/BottomNavbar";

const PostDetail = ({ setUser, currentUserId }) => {

    const params = useParams()
    const navigate = useNavigate()
    const post_id = params.post_id

    const [post, setPost] = useState({})
    const [comments, setComments] = useState([])

    useEffect(() => {
        const getPost = async () => {
            const res = await fetch(`https://social-media-app-five-rust.vercel.app/api/posts/${post_id}`)
            const data = await res.json()

            setPost(data)
        }

        getPost()
    }, [])

    useEffect(() => {
        const getComments = async () => {
            const res = await fetch(`https://social-media-app-five-rust.vercel.app/api/comments/${post_id}`)
            const data = await res.json()

            setComments(data)
        }

        getComments()
    })

    const handleDeletePost = async (e) => {
        const res = await fetch(`https://social-media-app-five-rust.vercel.app/api/posts/${post_id}`, {
            method: "DELETE"
        })

        const data = await res.json()

        if (res.ok) {

            toast.success("Post deleted successfully")
            setTimeout(() => {
                navigate(`/${currentUserId}`)
            }, 500)

        }


        console.log(data)
    }

    return <>
    
    <TopNavbar/>
    <div className="flex flex-col md:flex-row">
        <LeftSidebar setUser={setUser} currentUserId={currentUserId} />

        <div className=" w-full md:w-5/6
                        grid grid-cols-1 lg:grid-cols-2
                        gap-6
                        pt-20 md:pt-10
                        pb-20 md:pb-10
                        px-3 md:px-6">

            <div className="px-2 md:px-4 lg:border-r-2">

                <div className="flex justify-center items-center pb-5 border-b">
                    <img src={`${post.imageUrl}`} className="w-full
                                                            max-w-3xl
                                                            aspect-square
                                                            object-cover
                                                            rounded-lg" />
                </div>

                <div className="mt-5 px-2">
                    <h1 className="font-semibold text-lg">Description</h1>
                    <p>{post.description}</p>
                </div>
            </div>

            <div className=" comments
                            w-full
                            bg-white
                            dark:bg-gray-900
                            rounded-lg
                            p-3 md:p-5">
                {
                    comments.map((comment) => <div className="pt-4 border-b last:border-b-0 pb-4">

                        <div className="flex items-start pb-2">
                            <img src={`${comment.profile_pic_url}`}
                                className="h-10 w-10 rounded-full object-cover flex-shrink-0" alt="" />

                            <div className="ml-4 flex-1">
                                <span className="font-semibold mr-2">
                                    {comment.username}
                                </span>

                                <span className="break-words">
                                    {comment.comment}
                                </span>
                            </div>

                        </div>


                    </div>)
                }
            </div>
            {
                currentUserId == post.user_id &&
                <div className="flex justify-center lg:col-span-2 mt-4">
                    <button className=" bg-red-500
                                    text-white
                                    px-5
                                    py-2
                                    rounded-md
                                    hover:bg-red-600
                                    transition"
                        onClick={(e) => { handleDeletePost(e) }}>Delete Post</button>
                </div>
            }
        </div>

        <Toaster />

    </div>
    <BottomNavbar />
    </>
}

export default PostDetail;