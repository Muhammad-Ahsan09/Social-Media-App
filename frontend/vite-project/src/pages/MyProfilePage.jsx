import { useEffect, useState } from "react"
import LeftSidebar from "../components/LeftSidebar"
import { Link, useParams } from "react-router-dom"
import LazyImage from "../components/Image"

const MyProfilePage = ({ currentUserId }) => {

    const params = useParams()
    const [clickedProfilePic, setClickedProfilePic] = useState(false)
    const [image, setImage] = useState(null)
    const userid = params.userid
    const [user, setUser] = useState({})
    const [friends, setFriends] = useState([])
    const [sentRequest, setSentRequest] = useState(false)
    const [posts, setPosts] = useState([])



    useEffect(() => {
        const checkSentRequest = async () => {
            const res = await fetch(`https://social-media-app-five-rust.vercel.app/api/sent_friend_request/${currentUserId}/${userid}`)
            const data = await res.json()
            setSentRequest(data)
            console.log(sentRequest)
        }

        checkSentRequest()
    }, [])

    useEffect(() => {
        const getUser = async () => {
            const res = await fetch(`https://social-media-app-five-rust.vercel.app/api/users/${userid}`)
            setUser(await res.json())
        }



        getUser()

    }, [])


    useEffect(() => {
        const getFriends = async () => {
            const res = await fetch(`https://social-media-app-five-rust.vercel.app/api/friends/${currentUserId}`)
            let data = await res.json()
            console.log("Friends", data)
            data = data.map((friend) => friend.id)

            setFriends(data)
        }

        getFriends()
    }, [])

    useEffect(() => {
        const getPosts = async () => {
            const res = await fetch(`https://social-media-app-five-rust.vercel.app/api/userposts/${userid}`)
            const data = await res.json()

            setPosts(data)
        }
        getPosts()
    }, [])



    const handleImageUpload = async (e) => {
        e.preventDefault()
        const form = new FormData()

        form.append("profileImage", image)

        console.log(image)

        const data = await fetch(`https://social-media-app-five-rust.vercel.app/api/profile_image/${userid}`, {
            method: "PATCH",
            body: form
        })

        if (data.ok) {
            setClickedProfilePic(false)
        }

    }

    const handleClickFollowButton = async (e) => {
        e.preventDefault()

        // setFriends([...friends, userid])
        const res = await fetch(`https://social-media-app-five-rust.vercel.app/api/friend_requests/${currentUserId}/${userid}`, {
            method: "POST",
        })

        const data = await res.json()


        console.log(data)

    }

    const handleClickUnfollowButton = async (e) => {
        // TODO

        const newFriends = friends.map((friend) => friend.id != userid)
        setFriends(newFriends)
        const res = await fetch(`https://social-media-app-five-rust.vercel.app/api/friends/${userid}/${currentUserId}`, {
            method: "DELETE"
        })

        const data = await res.json()
        console.log(data)
    }




    return <div className={`flex ${clickedProfilePic && "bg-black bg-opacity-50"} transition-all w-full`}>
        <LeftSidebar currentUserId={currentUserId} />

        <div className="main-section w-4/6 ">
            <div className="flex w-full justify-center items-center border-b pb-20">
                <div className="-ml-20 cursor-pointer mt-20" onClick={() => { currentUserId == userid && setClickedProfilePic(true) }}  >
                    <div className="rounded-full border-2 border-slate-300 p-1">
                        <img src={`${user.profile_pic_url}`} alt=""
                            className="rounded-full w-40 h-40" />
                    </div>
                </div>

                <div className="flex items-center ">
                    <div className=" text-xl ml-24">
                        <h1>{user.full_name}</h1>
                    </div>

                    {
                        currentUserId == userid ?
                            <div className="ml-10 font-medium">
                                <button className="bg-slate-200 pl-2 pr-2 pt-1 pb-1 rounded dark:bg-gray-800 ">Edit profile</button>
                            </div> :

                            friends.includes(Number(userid)) ?

                                <div className="ml-10 font-medium" onClick={(e) => { handleClickUnfollowButton(e) }}>
                                    <button className="bg-slate-200 pl-2 pr-2 pt-1 pb-1 rounded dark:bg-gray-800 ">Unfollow</button>
                                </div>

                                :

                                sentRequest ?
                                    <div className="ml-10 font-medium" >
                                        <button className="bg-slate-200 pl-2 pr-2 pt-1 pb-1 rounded dark:bg-gray-800 ">Sent Request</button>
                                    </div>

                                    :
                                    <div className="ml-10 font-medium" onClick={(e) => { handleClickFollowButton(e); setSentRequest(true) }}>
                                        <button className="bg-slate-200 pl-2 pr-2 pt-1 pb-1 rounded dark:bg-gray-800 ">Follow</button>
                                    </div>




                    }


                    <div className="ml-5 font-medium">
                        <button className="bg-slate-200 pl-2 pr-2 pt-1 pb-1 rounded dark:bg-gray-800 ">View Archive</button>
                    </div>


                </div>


            </div>
            <div className="w-full">
            {
                clickedProfilePic && <div className="fixed shadow-lg  bg-white left-1/2 
            rounded-md w-1/3 h-1/3 -translate-x-1/2 -translate-y-1/2 transition-all">
                    <div className="flex justify-center items-center h-1/3 border-b">
                        Change Profile Photo
                    </div>

                    <div className="flex justify-center items-center cursor-pointer border-b h-1/5 text-blue-400 font-medium">

                        <form>
                            <input type="file" id="image"
                                className="cursor-pointer" onChange={(e) => { setImage(e.target.files[0]) }} />
                        </form>


                        <button onClick={(e) => { handleImageUpload(e) }}>
                            Upload Photo
                        </button>
                    </div>

                    <div className="flex justify-center items-center cursor-pointer border-b h-1/5 text-blue-400 font-medium"
                    >
                        Remove Current Photo
                    </div>

                    <div className="flex justify-center items-center cursor-pointer h-1/5 text-red-500"
                        onClick={() => { setClickedProfilePic(false) }}>
                        Cancel
                    </div>
                </div> 
            }
                <div className="font-bold flex items-center justify-center w-full">
                    POSTS
                </div>

                <div className="grid grid-cols-3 w-full">
                    
                        {
                            posts.map((post) => <div className={` p-5 cursor-pointer hover:opacity-50`}>
                                    <Link to={`/posts/${post.id}`}>
                                        <LazyImage src={`${post.imageUrl}`} className="" />
                                    </Link>
                                
                            </div>)
                        }
                </div>
            </div>

            {/* <div>
                <h1>My Posts</h1>
            </div> */}


            

        </div>



    </div>


}

export default MyProfilePage