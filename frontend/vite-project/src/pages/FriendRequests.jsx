import { useEffect, useState } from "react"
import LeftSidebar from "../components/LeftSidebar"
import { FaRegCheckCircle } from "react-icons/fa";
import { RxCrossCircled } from "react-icons/rx";
import { Link } from "react-router-dom";




const FriendRequests = ({currentUserId}) => {

    const [requests, setRequests] = useState([])
    useEffect(() => {
        const getFriendRequests = async () => {
            const res = await fetch(`https://social-media-app-five-rust.vercel.app/api/friend_requests/${currentUserId}`)
            const data = await res.json()

            setRequests(data)

        }

        getFriendRequests()
    }, [])

    const handleAcceptFriendRequest = async (e, requestUserId) => {

        const newRequests = requests.map((request) => request.id != requestUserId)
        setRequests(newRequests)
        console.log(requests)
        
        const res = await fetch(`https://social-media-app-five-rust.vercel.app/api/friend_request/${requestUserId}/${currentUserId}`, {
            method: "PATCH"
        })

        const data = await res.json()
        console.log(data)
    }

    return <div className="flex transition-all">

        <LeftSidebar currentUserId={currentUserId}/>
        
        {
            requests.length != 0  ?
            requests.map((request) => <div className="border-b-2 h-1/4 w-4/6">
            
            <div className="flex  items-center">
                <Link to={`/profile/${request.id}`}>
                    <div>
                        <img src={`${request.profile_pic_url}`} alt="" 
                        className="h-16 w-16 rounded-full"/>
                    </div>

                    <div className="ml-10 font-medium text-lg">
                        <h1>{request.full_name}</h1>
                    </div>
                </Link>

                <div className="absolute right-20 flex">
                    <div className="flex items-center mr-10" onClick={(e) => {handleAcceptFriendRequest(e, request.id)}}>
                        <span className="font-medium">Accept</span>
                         <FaRegCheckCircle className="ml-2 w-6 h-6 cursor-pointer hover:bg-green-500 hover:text-white rounded-full transition-all"/>
                    </div>

                    <div className="flex items-center">
                        <span className="font-medium">Reject</span>
                         <RxCrossCircled className="ml-2 w-6 h-6 cursor-pointer hover:bg-red-500 hover:text-white rounded-full transition-all"/>
                    </div>
                </div>
            
            </div>
            
             </div>) 
             : 
             <div className="flex justify-center items-center w-5/6 font-bold text-3xl">
                <h1>You have no Friend Requests</h1>
             </div>
        }
        
        </div>
}

export default FriendRequests