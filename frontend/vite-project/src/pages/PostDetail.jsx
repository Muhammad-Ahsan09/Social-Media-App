import { useEffect, useState } from "react";
import LeftSidebar from "../components/LeftSidebar";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const PostDetail = ({setUser, currentUserId}) => {

    const params = useParams()
    const navigate = useNavigate()
    const post_id = params.post_id

    const [post, setPost] = useState({})
    const [comments, setComments] = useState([])

    useEffect(() => {
        const getPost = async () => {
            const res = await fetch(`http://localhost:8000/api/posts/${post_id}`)
            const data = await res.json()

            setPost(data)
        }

        getPost()
    }, [])

    useEffect(() => {
        const getComments = async () => {
            const res = await fetch(`http://localhost:8000/api/comments/${post_id}`)
            const data = await res.json()

            setComments(data)
        }

        getComments()
    })

    const handleDeletePost = async (e) => {
       const res =  await fetch(`http://localhost:8000/api/posts/${post_id}`, {
            method: "DELETE"
        })

        const data = await res.json()

        if(res.ok){
            
            toast.success("Post deleted successfully")
            setTimeout(() => {
                navigate(`/${currentUserId}`)
            }, 500)
            
        }


        console.log(data)
    }

    return <div className="flex ">
        <LeftSidebar setUser={setUser} currentUserId={currentUserId}/>

        <div className="grid grid-cols-2 w-5/6 pt-10 pb-10  gap-5">

            <div className="pl-4 pr-4 border-r-2">

                <div className="flex justify-center items-center mr-5 pb-5 border-b">
                    <img src={`http://localhost:8000/post-images/${post.imageUrl}`} className="" />
                </div>

                <div>
                    <h1 className="font-semibold">Description</h1>
                    <p>{post.description}</p>
                </div>
            </div>

            <div className="comments w-full h-full">
                {
                    comments.map((comment) => <div className="pt-4">

                        <div className="flex items-center pb-2">
                            <img src={`http://localhost:8000/profile-images/${comment.profile_pic_url}`}
                            className="h-10 w-10 rounded-full" alt="" />

                            <h1 className="ml-4 font-semibold">
                                {comment.username}
                            </h1>

                            <div className="ml-2">
                                {comment.comment}
                            </div>

                        </div>

                        
                    </div>)
                }
            </div>
            {
                currentUserId == post.user_id &&
                <div className="flex justify-center">
                    <button className="bg-red-500 text-white pl-3 pr-3 pt-2 pb-2 rounded"
                    onClick={(e) => {handleDeletePost(e)}}>Delete Post</button>
                </div>
            }
        </div>

        <Toaster/>

    </div>
}

export default PostDetail;