import { useEffect, useState } from "react"
import LeftSidebar from "../components/LeftSidebar"
import { Link, useParams } from "react-router-dom"
import LazyImage from "../components/Image"
import BottomNavbar from "../components/BottomNavbar"

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




    return <>
        <div className="flex flex-col md:flex-row transition-all w-full">

        {
    clickedProfilePic &&
    <div className="fixed inset-0 bg-black/50 z-40 flex justify-center items-center">

        <div
            className="bg-white dark:bg-gray-900 shadow-lg rounded-md
            w-[90%] md:w-1/3 max-w-md"
            onClick={(e) => e.stopPropagation()}
        >

            <div className="flex justify-center items-center py-5 border-b">
                Change Profile Photo
            </div>

            <div className="flex flex-col items-center justify-center py-5 border-b">

                <form>
                    <input
                        type="file"
                        id="image"
                        className="cursor-pointer"
                        onChange={(e) => {
                            setImage(e.target.files[0]);
                        }}
                    />
                </form>

                <button
                    className="mt-3 text-blue-400 font-medium"
                    onClick={(e) => {
                        handleImageUpload(e);
                    }}
                >
                    Upload Photo
                </button>

            </div>

            <div className="flex justify-center items-center cursor-pointer py-5 border-b text-blue-400 font-medium">
                Remove Current Photo
            </div>

            <div
                className="flex justify-center items-center cursor-pointer py-5 text-red-500"
                onClick={() => {
                    setClickedProfilePic(false);
                }}
            >
                Cancel
            </div>

        </div>

    </div>
}
            <LeftSidebar currentUserId={currentUserId} />

            <div className="main-section w-full md:w-4/6 pb-20 md:pb-0 ">
                <div className="flex flex-col md:flex-row w-full justify-center items-center border-b pb-10 md:pb-20 px-4">
                    <div className="cursor-pointer mt-10 md:mt-20 md:-ml-20" onClick={() => { currentUserId == userid && setClickedProfilePic(true) }}  >
                        <div className="rounded-full border-2 border-slate-300 p-1">
                            <img src={`${user.profile_pic_url}`} alt=""
                                className="rounded-full w-28 h-28 md:w-40 md:h-40" />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center mt-5 md:mt-0">
                        <div className="text-lg md:text-xl md:ml-24 text-center md:text-left">
                            <h1>{user.full_name}</h1>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4 md:mt-0 md:ml-10">

                            

                            <div className="font-medium">
                                <button className="bg-slate-200 pl-2 pr-2 pt-1 pb-1 rounded dark:bg-gray-800 ">View Archive</button>
                            </div>

                        </div>


                    </div>


                </div>
                <div className="w-full">
                    {
                        clickedProfilePic &&
                        <div className="fixed inset-0 flex justify-center items-center z-50">

                            <div className="bg-white dark:bg-gray-900 shadow-lg rounded-md
                                        w-[90%] md:w-1/3
                                        max-w-md
                                        h-auto">
                                <div className="flex justify-center items-center py-5 border-b">
                                    Change Profile Photo
                                </div>

                                <div className="flex justify-center items-center cursor-pointer border-b py-5 text-blue-400 font-medium">

                                    <form>
                                        <input type="file" id="image"
                                            className="cursor-pointer" onChange={(e) => { setImage(e.target.files[0]) }} />
                                    </form>


                                    <button onClick={(e) => { handleImageUpload(e) }}>
                                        Upload Photo
                                    </button>
                                </div>

                                <div className="flex justify-center items-center cursor-pointer border-b py-5 text-blue-400 font-medium"
                                >
                                    Remove Current Photo
                                </div>

                                <div className="flex justify-center items-center cursor-pointer py-5 text-red-500"
                                    onClick={() => { setClickedProfilePic(false) }}>
                                    Cancel
                                </div>
                            </div>
                        </div>
                    }
                    <div className="font-bold flex items-center justify-center w-full py-4 text-lg">
                        POSTS
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 w-full">

                        {
                            posts.map((post) => <div className={`p-1 md:p-5 cursor-pointer hover:opacity-50`}>
                                <Link to={`/posts/${post.id}`}>
                                    <LazyImage src={`${post.imageUrl}`} className="w-full aspect-square object-cover rounded" />
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
        <BottomNavbar />
    </>


}

export default MyProfilePage