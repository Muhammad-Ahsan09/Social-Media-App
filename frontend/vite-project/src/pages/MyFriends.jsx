import { useEffect, useState } from "react"
import LeftSidebar from "../components/LeftSidebar"
import { TbH1 } from "react-icons/tb"
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import BottomNavbar from "../components/BottomNavbar";


const MyFriends = ({ setUser, currentUserId }) => {

    const [friends, setFriends] = useState([])

    useEffect(() => {
        const getFreinds = async () => {
            const res = await fetch(`https://social-media-app-five-rust.vercel.app/api/friends/${currentUserId}`)
            const data = await res.json()
            console.log(data)
            setFriends(data)
        }

        getFreinds()
    }, [])

    return <> 
    <div className="flex flex-col md:flex-row">
        <LeftSidebar setUser={setUser} currentUserId={currentUserId} />

        {
            friends.length == 0 ?

                <div className="flex justify-center items-center w-4/6 font-bold text-3xl">
                    <h1>You have no friends</h1>
                </div>

                :
                <div className="w-5/6">
                    {
                        friends.map((friend) => <div className="border-b-2 h-1/4 w-full p-4">

                            <div className="flex items-center">
                                <Link to={`/profile/${friend.id}`} className="flex items-center">
                                    <div>
                                        <img src={`${friend.profile_pic_url}`}
                                            alt="" className="w-16 h-16 rounded-full" />
                                    </div>

                                    <div className="ml-10 font-medium text-lg">
                                        <h1>{friend.full_name}</h1>
                                    </div>
                                </Link>

                                <Link to={`/chats/${friend.id}`}>
                                    <div className="absolute right-20 font-medium">
                                        <div className="flex justify-center items-center text-blue-500 cursor-pointer">
                                            <span>Open Chat</span>

                                            <IoChatbubbleEllipsesOutline
                                                className="ml-3 text-blue-500 h-8 w-8 cursor-pointer transition-all rounded-3xl
                                hover:bg-blue-500 hover:text-white"/>
                                        </div>
                                    </div>
                                </Link>
                            </div>

                        </div>)
                    }
            </div>
        }

    </div>
    <BottomNavbar/>
    </>
}

export default MyFriends