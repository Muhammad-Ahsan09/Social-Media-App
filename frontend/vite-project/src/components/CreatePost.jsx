import { useRef, useState } from "react";
import { IoMdPhotos } from "react-icons/io";
import {useParams} from "react-router-dom"

import toast, {  Toaster } from "react-hot-toast";


const CreatePost = ({ setPosting}) => {
    

    const [fileRecieved, setFileRecieved] = useState(false)
    const [fileDone, setFileDone] = useState(false)

    const [description, setDescription] = useState("")
    const [file, setFile] = useState(null)

    const params = useParams()



    const form = new FormData()

    const handleFormSubmit = async (e) => {
        
        e.preventDefault()

        const user_id = params.userid
        form.append("description", description)
        form.append("user_id", user_id)
        form.append("file", file)
        
        const res = await fetch("http://localhost:8000/api/posts", {
            method: "POST",
            body: form
        })

        const data = res.json()

        if(!res.ok)
        {
            toast.error("Post not posted")
        }

        else{
            toast.success("Post uploaded")
            setPosting(false)
        }
    }


    return <div className="rounded-md h-full dark:bg-gray-800">
        <div className="flex justify-center items-center h-10 border-b-2">
            <h1>Create new post</h1>
            <div className="cursor-pointer transition-all rounded-full p-4
            absolute right-2 hover:bg-slate-300 w-5 h-5 flex justify-center items-center"
            onClick={() => {setPosting(false)}}>
                X
            </div>
        </div>

        <div className="h-1/2 text-xl">

            {
                fileDone ?
                <>
                    <form onSubmit={(e) => {handleFormSubmit(e)}} encType="multipart/form-data">
                        <textarea name="" id="" cols="30" rows="10" value={description}
                        onChange={(e) => {setDescription(e.target.value)}}
                        className="outline-none pl-4 pt-5 font-normal w-full pr-4 dark:bg-gray-800" placeholder="Enter the description here">

                        </textarea>
                        <div className="flex justify-center items-center">
                            <button type="submit" 
                            className="bg-blue-500 text-white pl-10 pr-10 rounded-md" >Post</button>
                        </div>
                    </form>
                </>
                
                : 
                <>
                    <IoMdPhotos className="w-20 h-20 ml-auto mr-auto mt-10"/>
                    <h1 className="ml-20  mt-5">Drag photos and videos here</h1>
                </>
            }
            
        
        </div>

     
        <div className="flex justify-center items-center">

            {
                fileRecieved && !fileDone ?  <button onClick={() => {setFileDone(true)}}
                className="bg-blue-500 w-40 rounded-md h-7 text-white">next</button> : 

                !fileDone &&
                <form>
                    <input  type="file" id="image" value={file} 
                    className="cursor-pointer" onChange={(e) => {setFileRecieved(true); setFile(e.target.files[0])}}/>
                </form>
            }
            
        </div>

        <Toaster/>
        
    </div>
}


export default CreatePost;