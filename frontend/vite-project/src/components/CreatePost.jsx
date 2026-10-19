import { useState } from "react";
import { IoMdPhotos } from "react-icons/io";
import { useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const CreatePost = ({ setPosting }) => {
    const [fileRecieved, setFileRecieved] = useState(false);
    const [fileDone, setFileDone] = useState(false);
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);

    const params = useParams();

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const user_id = params.userid;

        // 1. Move FormData initialization inside the submit handler
        const form = new FormData();
        form.append("description", description);
        form.append("user_id", user_id);
        form.append("file", file); // Multer expects this key to match your backend (e.g., upload.single('file'))
        
        try {
            const res = await fetch(`${BACKEND_URL}/api/posts`, {
                method: "POST",
                body: form
            });

            // 2. Added missing await here
            const data = await res.json(); 

            if (!res.ok) {
                toast.error(data.error || "Post not posted");
            } else {
                toast.success("Post uploaded");
                setPosting(false);
            }
        } catch (error) {
            toast.error("An error occurred during upload");
        }
    };


return (
    <div
        className="w-full max-w-lg overflow-hidden rounded-2xl
                   border border-[#D6DFD9] bg-[#F6F7F4]
                   shadow-2xl
                   dark:border-[#344A43] dark:bg-[#1D3028]"
    >
        {/* Header */}
        <div className="flex items-center justify-between
                        border-b border-[#D6DFD9] px-5 py-4
                        dark:border-[#344A43]">

            <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                    Create a Post
                </h3>

                <p className="mt-1 text-xs text-[#78877F] dark:text-[#9EB1A4]">
                    Share something with your world.
                </p>
            </div>

            <button
                type="button"
                onClick={() => setPosting(false)}
                aria-label="Close modal"
                className="rounded-full p-2 text-[#78877F]
                           transition hover:bg-[#E9EFEB]
                           dark:text-[#9EB1A4]
                           dark:hover:bg-[#304438]"
            >
                ✕
            </button>
        </div>

        {/* Post Content */}
        <div className="p-5">

            {!fileDone ? (
                <>
                    {/* Upload Area */}
                    <label
                        htmlFor="image"
                        className="flex min-h-60 cursor-pointer
                                   flex-col items-center justify-center
                                   overflow-hidden rounded-xl border-2
                                   border-dashed border-[#CBD8CE]
                                   bg-[#E9EFEB] text-center transition
                                   hover:border-[#397E6D]
                                   dark:border-[#40574C]
                                   dark:bg-[#17251F]
                                   dark:hover:border-[#78BFA7]"
                    >
                        {fileRecieved && file ? (
                            <div className="flex flex-col items-center p-4">
                                {file.type.startsWith("image/") ? (
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt="Selected post preview"
                                        className="max-h-64 max-w-full rounded-lg object-contain"
                                    />
                                ) : (
                                    <video
                                        src={URL.createObjectURL(file)}
                                        controls
                                        className="max-h-64 max-w-full rounded-lg"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                )}

                                <span className="mt-3 text-sm font-medium
                                                 text-[#397E6D]
                                                 dark:text-[#A9DCC8]">
                                    Choose another file
                                </span>

                                <span className="mt-1 max-w-full truncate px-2
                                                 text-xs text-[#78877F]
                                                 dark:text-[#9EB1A4]">
                                    {file.name}
                                </span>
                            </div>
                        ) : (
                            <>
                                <div className="mb-3 flex h-12 w-12
                                                items-center justify-center
                                                rounded-full bg-white
                                                text-[#397E6D]
                                                dark:bg-[#253A31]
                                                dark:text-[#A9DCC8]">
                                    <IoMdPhotos className="h-6 w-6" />
                                </div>

                                <span className="text-sm font-medium
                                                 text-gray-800
                                                 dark:text-gray-100">
                                    Add photos or videos
                                </span>

                                <span className="mt-1 text-xs
                                                 text-[#78877F]
                                                 dark:text-[#9EB1A4]">
                                    Select a file from your device
                                </span>
                            </>
                        )}
                    </label>

                    <input
                        type="file"
                        id="image"
                        accept="image/*,video/*"
                        className="sr-only"
                        onChange={(e) => {
                            const selectedFile = e.target.files?.[0];

                            if (selectedFile) {
                                setFileRecieved(true);
                                setFile(selectedFile);
                            }
                        }}
                    />

                    {/* Next Button */}
                    <button
                        type="button"
                        onClick={() => setFileDone(true)}
                        disabled={!fileRecieved || !file}
                        className="mt-5 w-full rounded-xl
                                   bg-[#397E6D] px-4 py-3
                                   text-sm font-semibold text-white
                                   transition hover:bg-[#2F6B5C]
                                   disabled:cursor-not-allowed
                                   disabled:opacity-50"
                    >
                        Next
                    </button>
                </>
            ) : (
                /* Description and Submit */
                <form onSubmit={handleFormSubmit}>
                    <div className="mb-4 overflow-hidden rounded-xl
                                    border border-[#D6DFD9]
                                    bg-white dark:border-[#344A43]
                                    dark:bg-[#17251F]">

                        <div className="flex items-center gap-3
                                        border-b border-[#E5EBE6]
                                        p-3 dark:border-[#344A43]">
                            {file && file.type.startsWith("image/") ? (
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt="Post thumbnail"
                                    className="h-12 w-12 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="flex h-12 w-12
                                                items-center justify-center
                                                rounded-lg bg-[#E9EFEB]
                                                text-[#397E6D]
                                                dark:bg-[#253A31]
                                                dark:text-[#A9DCC8]">
                                    <IoMdPhotos className="h-6 w-6" />
                                </div>
                            )}

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium
                                              text-gray-800
                                              dark:text-gray-100">
                                    Your post
                                </p>

                                <p className="truncate text-xs
                                              text-[#78877F]
                                              dark:text-[#9EB1A4]">
                                    {file?.name}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setFileDone(false)}
                                className="shrink-0 text-xs font-medium
                                           text-[#397E6D] hover:underline
                                           dark:text-[#A9DCC8]"
                            >
                                Change
                            </button>
                        </div>

                        <textarea
                            rows={5}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What's on your mind?"
                            className="w-full resize-none bg-transparent
                                       p-4 text-sm text-gray-800 outline-none
                                       placeholder:text-[#9AA79F]
                                       dark:text-gray-100
                                       dark:placeholder:text-[#788F82]"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!file}
                        className="w-full rounded-xl bg-[#397E6D]
                                   px-4 py-3 text-sm font-semibold
                                   text-white transition hover:bg-[#2F6B5C]
                                   disabled:cursor-not-allowed
                                   disabled:opacity-50"
                    >
                        Share Post
                    </button>
                </form>
            )}
        </div>

        <Toaster />
    </div>
);

};

export default CreatePost;
