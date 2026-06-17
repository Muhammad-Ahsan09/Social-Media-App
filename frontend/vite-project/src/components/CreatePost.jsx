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
        
        const res = await fetch("https://social-media-app-five-rust.vercel.app/api/posts", {
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


    return <div className="rounded-md w-full h-full dark:bg-gray-800 bg-white">
        <div className="relative flex justify-center items-center h-12 border-b-2">
            <h1>Create new post</h1>
            <div className="cursor-pointer transition-all rounded-full
                            absolute right-3 top-1/2 -translate-y-1/2
                            hover:bg-slate-300 dark:hover:bg-gray-700
                            w-8 h-8 flex justify-center items-center"
            onClick={() => {setPosting(false)}}>
                X
            </div>
        </div>

        <div className="min-h-[250px] md:min-h-[300px] text-lg md:text-xl">

            {
                fileDone ?
                <>
                    <form onSubmit={(e) => {handleFormSubmit(e)}} encType="multipart/form-data">
                        <textarea name="" id=""  rows="8" value={description}
                        onChange={(e) => {setDescription(e.target.value)}}
                        className="outline-none p-4 font-normal w-full min-h-[250px]
                                    resize-none dark:bg-gray-800" placeholder="Enter the description here">

                        </textarea>
                        <div className="flex justify-center items-center">
                            <button type="submit" 
                            className="bg-blue-500 text-white px-8 py-2 rounded-md" >Post</button>
                        </div>
                    </form>
                </>
                
                : 
                <>
                    <IoMdPhotos className="w-16 h-16 md:w-20 md:h-20 mx-auto mt-10"/>
                    <h1 className="ml-20 mt-5">
                        Drag photos and videos here
                    </h1>
                </>
            }
            
        
        </div>

     
        <div className="flex justify-center items-center">

            {
                fileRecieved && !fileDone ?  <button onClick={() => {setFileDone(true)}}
                className="bg-blue-500 w-32 md:w-40 rounded-md h-9 text-white">next</button> : 

                !fileDone &&
                <form>
                    <div>
                        <label className="bg-blue-500 text-white px-4 py-2 text-sm cursor-pointer rounded" htmlFor="image">Select from computer</label>
                        <input  type="file" id="image" value={file} 
                        className="hidden cursor-pointer" onChange={(e) => {setFileRecieved(true); setFile(e.target.files[0])}}/>
                    </div>
                </form>
            }
            
        </div>

        <Toaster/>
        
    </div>
}


export default CreatePost;