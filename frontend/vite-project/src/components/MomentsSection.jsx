

const StoriesSection = () => {

const stories = [
    {
        title: "story1",
        picUrl: "images/MuhammadAhsan.jpg"
    }, 
    {title: "story2"},
    {title: "story3"},
    {title: "story4"},
    {title: "story5"},
    {title: "story6"},
    {title: "story7"},
    {title: "story8"},
    {title: "story5"},
    {title: "story5"},]


    


    return <div className="flex mt-10 ml-7 overflow-x-scroll w-5/6 scroll-hidden"> 
        {
            stories.map((story) => 
                <div className="mr-3 min-w-20">
                    <div className="bg-yellow-400 flex justify-center items-center rounded-full p-1">
                        <img src="images/MuhammadAhsan.jpg" width="60px"
                        className="rounded-full max-h-14"/>
                    </div>
                    <p className="flex justify-center">
                        Title
                    </p>
                </div>
            )
        }
    </div>

}

export default StoriesSection;