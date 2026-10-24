import { useEffect, useState } from "react"
import LeftSidebar from "../components/LeftSidebar"
import { Link, useParams } from "react-router-dom"
import LazyImage from "../components/Image"
import BottomNavbar from "../components/BottomNavbar"
import TopNavbar from "../components/TopNavbar"
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const MyProfilePage = ({ currentUserId }) => {

    const params = useParams()
    const [clickedProfilePic, setClickedProfilePic] = useState(false)
    const [image, setImage] = useState(null)
    const userid = params.userid
    const [user, setUser] = useState({})
    const [friends, setFriends] = useState([])
    const [sentRequest, setSentRequest] = useState(false)
    const [posts, setPosts] = useState([])


    
const cardCorners = [
    "rounded-[26px_26px_26px_12px]",
    "rounded-[20px_28px_14px_28px]",
    "rounded-[28px_16px_28px_28px]",
    "rounded-[16px_28px_24px_28px]",
    "rounded-[28px_24px_16px_28px]",
];




    useEffect(() => {
        const checkSentRequest = async () => {
            const res = await fetch(BACKEND_URL + `/api/sent_friend_request/${currentUserId}/${userid}`)
            const data = await res.json()
            setSentRequest(data)
            console.log(sentRequest)
        }

        checkSentRequest()
    }, [])

    useEffect(() => {
        const getUser = async () => {
            const res = await fetch(BACKEND_URL + `/api/users/${userid}`)
            setUser(await res.json())
        }



        getUser()

    }, [])


    useEffect(() => {
        const getFriends = async () => {
            const res = await fetch(BACKEND_URL + `/api/friends/${currentUserId}`)
            let data = await res.json()
            console.log("Friends", data)
            data = data.map((friend) => friend.id)

            setFriends(data)
        }

        getFriends()
    }, [])

    useEffect(() => {
        const getPosts = async () => {
            const res = await fetch(BACKEND_URL + `/api/userposts/${userid}`)
            const data = await res.json()

            setPosts(data)
        }
        getPosts()
    }, [])



    const handleImageUpload = async (e) => {
        e.preventDefault()
        const form = new FormData()

        form.append("profileImage", image)

        const data = await fetch(BACKEND_URL + `/api/profile_image/${userid}`, {
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
        const res = await fetch(BACKEND_URL + `/api/friend_requests/${currentUserId}/${userid}`, {
            method: "POST",
        })

        const data = await res.json()

    }

    const handleClickUnfollowButton = async (e) => {
        // TODO

        const newFriends = friends.map((friend) => friend.id != userid)
        setFriends(newFriends)
        const res = await fetch(BACKEND_URL + `/api/friends/${userid}/${currentUserId}`, {
            method: "DELETE"
        })

        const data = await res.json()
    }




    return <>
        <TopNavbar />
        <div className={`flex flex-col md:flex-row transition-all w-full pt-14 md:pt-0`}>

            {
                clickedProfilePic &&
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#17251F]/60 px-4 backdrop-blur-sm"
                    onClick={() => setClickedProfilePic(false)}>

                    <div
                        className="w-full max-w-sm overflow-hidden rounded-2xl border border-[#D6DFD9] bg-[#F6F7F4] text-[#294C46] shadow-[0_20px_50px_-20px_rgba(41,76,70,0.45)] dark:border-[#344A43] dark:bg-[#1D3028] dark:text-[#E1EAE4]"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="flex items-center justify-center border-b border-[#DFE6E0] py-4 text-sm font-semibold dark:border-[#344A43]">
                            Change Profile Photo
                        </div>

                        <div className="flex flex-col items-center justify-center border-b border-[#DFE6E0] px-4 py-5 dark:border-[#344A43]">

                            <form>
                                <input
                                    type="file"
                                    id="image"
                                    className="cursor-pointer text-xs text-[#536E62] file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-[#E9EFEB] file:px-4 file:py-2 file:text-[13px] file:font-semibold file:text-[#294C46] hover:file:bg-[#DFE9E3] dark:text-[#C4D9CC] dark:file:bg-[#30483B] dark:file:text-[#E1EAE4] dark:hover:file:bg-[#3A5547]"
                                    onChange={(e) => {
                                        setImage(e.target.files[0]);
                                    }}
                                />
                            </form>

                            <button
                                className="mt-3 rounded-full bg-[#397E6D] px-4 py-1.5 text-[13px] font-semibold text-white transition hover:bg-[#2F6A5B] active:scale-95 dark:bg-[#78BFA7] dark:text-[#17251F] dark:hover:bg-[#A9DCC8]"
                                onClick={(e) => {
                                    handleImageUpload(e);
                                }}
                            >
                                Upload Photo
                            </button>

                        </div>

                        <div className="flex cursor-pointer items-center justify-center border-b border-[#DFE6E0] py-4 text-sm font-semibold text-[#397E6D] transition hover:bg-[#E9EFEB] dark:border-[#344A43] dark:text-[#A9DCC8] dark:hover:bg-[#30483B]">
                            Remove Current Photo
                        </div>

                        <div
                            className="flex cursor-pointer items-center justify-center py-4 text-sm font-semibold text-[#C96D70] transition hover:bg-[#E9EFEB] dark:hover:bg-[#30483B]"
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

            <div className="main-section w-full px-4 pb-32 pt-6 text-[#294C46] sm:px-6 md:w-4/6 md:pb-40 md:pt-10 dark:text-[#E1EAE4]">
                <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-[#D6DFD9] bg-[#F6F7F4] px-5 py-8 shadow-[0_8px_30px_-24px_rgba(41,76,70,0.25)] transition-colors duration-300 dark:border-[#344A43] dark:bg-[#1D3028] md:flex-row md:px-8 md:py-10">
                    <div className="cursor-pointer" onClick={() => { currentUserId == userid && setClickedProfilePic(true) }}  >
                        <div className="rounded-full border-2 border-[#78BFA7] p-1 transition hover:border-[#397E6D] dark:hover:border-[#A9DCC8]">
                            <img src={`${user.profile_pic_url}`} alt=""
                                className="h-28 w-28 rounded-full object-cover md:h-36 md:w-36" />
                        </div>
                    </div>

                    <div className="mt-5 flex flex-col items-center md:ml-10 md:mt-0 md:flex-row">
                        <div className="text-center text-lg font-semibold text-[#294C46] dark:text-[#E1EAE4] md:text-left md:text-xl">
                            <h1>{user.full_name}</h1>
                        </div>

                        <div className="mt-4 flex flex-wrap justify-center gap-2 md:ml-8 md:mt-0 md:justify-start">

                            {
                                currentUserId == userid ?
                                    <div className="font-medium">
                                        <button className="rounded-full border border-[#D6DFD9] bg-[#E9EFEB] px-4 py-1.5 text-[13px] font-semibold text-[#294C46] transition hover:bg-[#DFE9E3] active:scale-95 dark:border-[#344A43] dark:bg-[#30483B] dark:text-[#E1EAE4] dark:hover:bg-[#3A5547]">Edit profile</button>
                                    </div> :

                                    friends.includes(Number(userid)) ?

                                        <div className="font-medium" onClick={(e) => { handleClickUnfollowButton(e) }}>
                                            <button className="rounded-full border border-[#D6DFD9] bg-[#E9EFEB] px-4 py-1.5 text-[13px] font-semibold text-[#294C46] transition hover:bg-[#DFE9E3] active:scale-95 dark:border-[#344A43] dark:bg-[#30483B] dark:text-[#E1EAE4] dark:hover:bg-[#3A5547]">Unfollow</button>
                                        </div>

                                        :

                                        sentRequest ?
                                            <div className="font-medium" >
                                                <button className="rounded-full border border-[#D6DFD9] bg-[#E9EFEB] px-4 py-1.5 text-[13px] font-semibold text-[#294C46] transition hover:bg-[#DFE9E3] active:scale-95 dark:border-[#344A43] dark:bg-[#30483B] dark:text-[#E1EAE4] dark:hover:bg-[#3A5547]">Sent Request</button>
                                            </div>

                                            :
                                            <div className="font-medium" onClick={(e) => { handleClickFollowButton(e); setSentRequest(true) }}>
                                                <button className="rounded-full bg-[#397E6D] px-4 py-1.5 text-[13px] font-semibold text-white transition hover:bg-[#2F6A5B] active:scale-95 dark:bg-[#78BFA7] dark:text-[#17251F] dark:hover:bg-[#A9DCC8]">Follow</button>
                                            </div>

                            }


                            <div className="font-medium">
                                <button className="rounded-full border border-[#D6DFD9] bg-[#E9EFEB] px-4 py-1.5 text-[13px] font-semibold text-[#294C46] transition hover:bg-[#DFE9E3] active:scale-95 dark:border-[#344A43] dark:bg-[#30483B] dark:text-[#E1EAE4] dark:hover:bg-[#3A5547]">View Archive</button>
                            </div>

                        </div>


                    </div>


                </div>

                <div className="mt-8 w-full">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-[#294C46] dark:text-[#E1EAE4]">
                                Posts
                            </h2>
                            <p className="mt-1 text-sm text-[#82978C] dark:text-gray-400">
                                A collection of shared moments
                            </p>
                        </div>

                        <span className="rounded-full bg-[#E8EEE7] px-3 py-1 text-xs font-semibold text-[#42675A] dark:bg-gray-800 dark:text-[#B4D0BE]">
                            {posts.length} {posts.length === 1 ? "post" : "posts"}
                        </span>
                    </div>

                    {posts.length === 0 ? (
                        <div className="flex min-h-56 flex-col items-center justify-center rounded-[28px] border border-dashed border-[#D8E1D6] px-5 text-center dark:border-gray-700">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8EEE7] text-[#42675A] dark:bg-gray-800 dark:text-[#B4D0BE]">
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
                                    aria-hidden="true"
                                >
                                    <rect x="3" y="3" width="18" height="18" rx="4" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <path d="m21 15-5-5L5 21" />
                                </svg>
                            </div>

                            <h3 className="text-base font-semibold">
                                No posts yet
                            </h3>

                            <p className="mt-2 max-w-sm text-sm text-[#75877E] dark:text-gray-400">
                                Shared moments will find their place here.
                            </p>
                        </div>
                    ) : (
                        <div className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4 lg:gap-5 xl:columns-5">
                            {posts.map((post, index) => (
                                <article
                                    key={post.id ?? post._id}
                                    className="group mb-4 break-inside-avoid sm:mb-5"
                                >
                                    <Link
                                        to={`/posts/${post.id ?? post._id}`}
                                        aria-label={`View post ${index + 1}`}
                                        className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#719987] focus-visible:ring-offset-4 dark:focus-visible:ring-offset-gray-950"
                                    >
                                        <div
                                            className={`relative isolate overflow-hidden bg-[#E9EDE7] dark:bg-gray-800 ${cardCorners[index % cardCorners.length]
                                                }`}
                                        >
                                            {post.resource_type === "video" ? (
                                                <video
                                                    src={post.imageUrl}
                                                    muted
                                                    loop
                                                    playsInline
                                                    preload="metadata"
                                                    className="block h-auto max-h-[560px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                                                />
                                            ) : (
                                                <img
                                                    src={post.imageUrl}
                                                    alt={post.caption || "Profile post"}
                                                    loading="lazy"
                                                    className="block h-auto max-h-[560px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                                                />
                                            )}

                                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                            {post.resource_type === "video" && (
                                                <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="15"
                                                        height="15"
                                                        viewBox="0 0 24 24"
                                                        fill="currentColor"
                                                        aria-hidden="true"
                                                    >
                                                        <path d="m8 5 12 7-12 7z" />
                                                    </svg>
                                                </span>
                                            )}
                                        </div>

                                        {post.caption && (
                                            <p className="mt-2 px-1 text-sm font-medium leading-5 text-[#354F45] dark:text-gray-200">
                                                {post.caption}
                                            </p>
                                        )}
                                    </Link>
                                </article>
                            ))}
                        </div>
                    )}
                </div>

            </div>



        </div>
        <BottomNavbar currentUserId={currentUserId} />
    </>


}

export default MyProfilePage