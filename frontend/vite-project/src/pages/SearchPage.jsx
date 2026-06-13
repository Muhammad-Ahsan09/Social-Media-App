import { useEffect, useState } from "react";
import LeftSidebar from "../components/LeftSidebar";
import { FaRegHeart, FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import { IoIosHeart } from "react-icons/io";
import { IoChatbubbleOutline } from "react-icons/io5";
import { TbLocationShare } from "react-icons/tb";


const SearchPage = ({ setUser, currentUserId }) => {

    const [search, setSearch] = useState("")
    const [posts, setPosts] = useState([])
    const [likedPostsId, setLikedPostsId] = useState([])
    const [users, setUsers] = useState([])

    useEffect(() => {
        const getLikedPosts = async () => {
            const res = await fetch(`http://localhost:8000/api/liked_posts/${currentUserId}`)
            let data = await res.json()

            data = data.map((post) => post.id)
            console.log(data)
            setLikedPostsId(data)
        }
        getLikedPosts()
    }, [])


    const handleSearch = async () => {
        if (search.length === "") {
            return;
        }
        const res = await fetch(`http://localhost:8000/api/search/${search}`)
        const data = await res.json()

        setPosts(data[0])
        setUsers(data[1])

        console.log("Posts and users:", posts)
    }

    return <div className="flex">
        <LeftSidebar setUser={setUser} currentUserId={currentUserId} />

        <div className="w-5/6 p-5 ">
            <div className="border-b-2 dark:border-slate-800 flex items-center dark:bg-black bg-slate-100 rounded-md pr-4">
                <input type="text" value={search} onChange={(e) => { setSearch(e.target.value) }}
                    className=" h-10 p-3 outline-none w-full bg-slate-100 dark:bg-black" placeholder="Search Here..." />

                <button className="">
                    <FaSearch className="h-6 w-6" onClick={handleSearch} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-10 p-5 h-full">
                <div className="border-r-2 ">
                    
                    {
                        posts.length != 0  ?

                        posts.map((post, index) => <div className="w-2/3 mb-7" key={index}>

                            {

                                <div>
                                    {/* {console.log(post.profile_pic_url)} */}
                                    <Link to={`/profile/${post.user_id}`}>
                                        <div className="flex">
                                            <img src={`${post.profile_pic_url}`} alt="" className="rounded-full h-12 w-12 cursor-pointer" />
                                            <div className="ml-4 flex items-center font-semibold ">{post.full_name}</div>
                                        </div>
                                    </Link>

                                    <Link to={`/posts/${post.id}`}>
                                        <div className="">
                                            <img src={`${post.imageUrl}`} alt="" height="75%" className="mt-5 rounded w-full" />
                                        </div>
                                    </Link>
                                    <div className="mt-4">
                                        {

                                            likedPostsId.includes(post.id) ?
                                                <button> <IoIosHeart className="w-10 h-8" onClick={() => { handleUnlikePost(post.id) }} /> </button>
                                                :
                                                <button onClick={() => { handleLikePost(post.id) }}><FaRegHeart className="w-10 h-7" /></button>
                                        }


                                        <button><IoChatbubbleOutline className="w-10 h-7" /></button>
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
                                        View all comments
                                    </p>

                                    <div>
                                        <input type="text" name="" id="" placeholder="Add a comment..."
                                            className="outline-none dark:bg-black border-b w-full mt-2 text-slate-500" />
                                    </div>
                                </div>
                            }
                            
                        </div>)

                        :
                        search.length != 0 &&
                        <div className="flex items-center justify-center text-2xl font-medium text-slate-400">
                            <h1>No Related Posts Found</h1>
                        </div>
                    }
                </div>

                <div>
                    {
                        users.length != 0 ?
                        users.map((user) => <div className="flex items-center  border-b-2 p-4">

                            <Link to={`/profile/${user.id}`} className="flex items-center">
                                <div>
                                    <img src={`${user.profile_pic_url}`}
                                        alt="" className="w-16 h-16 rounded-full" />
                                </div>

                                <div className="ml-10 font-medium text-lg">
                                    <h1>{user.full_name}</h1>
                                </div>
                            </Link>

                        </div>)

                        :
                        search.length != 0 &&
                        <div className="flex items-center justify-center text-2xl font-medium text-slate-400">
                            <h1>No Related Users Found</h1>
                        </div>
                    }
                </div>
            </div>

        </div>

    </div>
}

export default SearchPage;