import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

const RightSidebar = () => {

    const [user, setUser] = useState({})
    const [friendSuggestions, setFriendSuggestions] = useState([])
    const params = useParams()

    const userid = params.userid

    useEffect(() => {
        const getUserData = async () => {
            const res = await fetch(`http://localhost:8000/api/users/${userid}`)
            setUser(await res.json())
        }

        const getFreindSuggestions = async () => {
            const res = await fetch(`http://localhost:8000/api/friendsuggestions/${userid}`)
            setFriendSuggestions(await res.json())
        }

        getUserData()
        getFreindSuggestions()
    }, [])

    // const user = {
    //     profilePicUrl: "images/MuhammadAhsan.jpg",
    //     name: "Username"

    // }
    return <div className=" pt-12">
        <div className="flex items-center">
            <img src={`http://localhost:8000/profile-images/${user.profile_pic_url}`} alt="" width="60" 
            className="rounded-full h-12 w-12"/>
            <p className="ml-5">{user.full_name}</p>

            <p className="absolute right-5 text-blue-500 cursor-pointer">Switch</p>

            
        </div>

        <div className="">
            <p className="text-slate-500 mt-5">
                Suggested for you
            </p>

        {/* <div className="flex items-center mb-5 mt-5">
            <img src={`http://localhost:8000/${user.profile_pic_url}`} alt="" width="60"  height="60" 
            className="rounded-full max-h-14"/>
            <p className="ml-5">{user.name}</p>

            <p className="absolute right-5 text-blue-500 cursor-pointer">Follow</p>
        </div>

        <div className="flex items-center mb-5">
            <img src={`http://localhost:8000/${user.profile_pic_url}`} alt="" width="60"  height="60" 
            className="rounded-full max-h-14"/>
            <p className="ml-5">{user.name}</p>

            <p className="absolute right-5 text-blue-500 cursor-pointer">Follow</p>
        </div>

        <div className="flex items-center">
            <img src={`http://localhost:8000/${user.profile_pic_url}`} alt="" width="60"  height="60" 
            className="rounded-full max-h-14"/>
            <p className="ml-5">{user.name}</p>

            <p className="absolute right-5 text-blue-500 cursor-pointer">Follow</p>
        </div> */}

        {
            
            friendSuggestions.map((suggestion, index) => <div className="flex items-center mt-3" key={index}>
                {/* {console.log(friendSuggestions)} */}
                                                    <Link to={`/profile/${suggestion.id}`} className="flex items-center">
                                                        <img src={`http://localhost:8000/profile-images/${suggestion.profile_pic_url}`} alt="" width="60"  height="60" 
                                                        className="rounded-full h-12 w-12"/>
                                                        <p className="ml-5">{suggestion.full_name}</p>
                                                    </Link>
                                                    <p className="absolute right-5 text-blue-500 cursor-pointer">Follow</p>
                                                </div>)
        }

        </div>
    </div>

}

export default RightSidebar