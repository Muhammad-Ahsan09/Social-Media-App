import { useEffect, useState } from "react"
import LeftSidebar from "../components/LeftSidebar"
import { Link, useParams } from "react-router-dom"
import { IoIosSend } from "react-icons/io";
import {io} from "socket.io-client"


const Chat = ({ setUser, currentUserId }) => {

    const [chats, setChats] = useState([])

    const socket = io("http://localhost:8000")

    socket.on("connect", () => {
        socket.emit("user-connected", currentUserId)

        socket.on("recieve-message", (text) => {
            
            setChats([...chats, text])
            // console.log(text)

        })
    })

    const params = useParams()
    const friend_id = params.friend_id

    const [message, setMessage] = useState("")

    const [friend, setFriend] = useState({})

    useEffect(() => {
        const getFriend = async () => {
            const res = await fetch(`http://localhost:8000/api/users/${friend_id}`)
            const data = await res.json()

            // console.log(data)
            setFriend(data)
        }

        getFriend()
    }, [])

    useEffect(() => {
        const getChat = async () => {
            const res = await fetch(`http://localhost:8000/api/chats/${friend_id}/${currentUserId}`)

            const data = await res.json()
            // console.log(data)
            setChats(data)
        }


        getChat()
    }, [])

    const handleSendMessage = async () => {
        if(message != "")
        {
            socket.emit("send-message", message,currentUserId, friend_id)
            setChats([...chats, {message, sender_id:currentUserId}])

            await fetch(`http://localhost:8000/api/chats/${friend_id}`, {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({
                    current_user_id: currentUserId,
                    message: message
                })

            })

            setMessage("")
            
        }

        
    }


    return <div className="flex">
        <LeftSidebar setUser={setUser} currentUserId={currentUserId} />

        <div className="h-1/4 w-5/6 pl-4 pt-4 ">
            {/* <div className="flex items-center border-b-2 p-4">
                <div>
                    <img src={`http://localhost:8000/profile-images/${friend.profile_pic_url}`}
                        alt="" className="w-12 h-12 rounded-full" />
                </div>

                <div className="ml-10 font-medium text-lg">
                    <h1>{friend.full_name}</h1>
                </div>

                
            </div> */}

            <div className="chat-window absolute h-3/4 w-3/5 pt-5 overflow-scroll scroll-hidden">
                    {
                        chats.map((chat) => <>
                        
                            {
                                
                                chat.sender_id == currentUserId ?
                                <div className="flex justify-end">
                                    <div className="flex justify-end bg-gray-400 mb-5 text-white pl-3 pt-1 pb-1 pr-5 w-max rounded">
                                        <h1>{chat.message}</h1>
                                    </div>
                                </div> :

                                <div className="">
                                    <div className=" bg-blue-500 text-white mb-5 pl-3 pt-1 pb-1 pr-5 rounded w-max">
                                        <h1>{chat.message}</h1>
                                    </div>
                                </div>
                            

                            }
                            
                        
                        </>

                        )
                    }
            </div>

            <div className=" dark:bg-black absolute bottom-5 w-4/5 border-t-2 border-slate-300 flex items-center"
            onClick={handleSendMessage}>
                <input type="text" className="dark:bg-black w-full h-10 p-4 outline-none" placeholder="Type..."
                 value={message} onChange={(e) => {setMessage(e.target.value)}}/>
                <button className=" text-blue-500 text-4xl pl-5 pr-5 rounded-full"><IoIosSend /></button>
            </div>

        </div>

        <div className="border-l flex w-1/6 items-start justify-center border-b-2 p-4 ">
            <div>
                <div>
                    <img src={`http://localhost:8000/profile-images/${friend.profile_pic_url}`}
                     className="w-28 h-28 rounded-full" />
                </div>

                <div className="ml-10 font-medium text-lg">
                    <h1>{friend.full_name}</h1>
                    
                </div>

                <div className="ml-10 text-gray-400">
                    <p>{friend.username}</p>
                </div>

                <div className="mt-10">
                    <Link to={`/profile/${friend_id}`}>
                        <button className="bg-blue-500 text-white rounded pr-3 pl-3 pt-1 pb-1">View Profile</button>
                    </Link>
                </div>
            </div>
                
        </div>

        
    </div>

}

export default Chat