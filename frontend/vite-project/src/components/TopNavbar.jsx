const TopNavbar = ({setUser}) => {

    const handleLogout = async (e) => {
        e.preventDefault()

        await fetch("https://social-media-app-five-rust.vercel.app/api/auth/logout", {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            credentials: "include"
        })

        setUser(false)
        // navigate("/login")

        
    }
    return (
        <div className="md:hidden fixed top-0 left-0 w-full h-14 bg-white dark:bg-black border-b dark:border-gray-800 flex items-center justify-between px-4 z-50">

            {/* App Name */}
            <div className="font-bold text-lg">
                GET SOCIAL
            </div>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="bg-slate-200 dark:bg-gray-800 px-3 py-1 rounded text-sm font-medium"
            >
                Logout
            </button>

        </div>
    );
}; 

export default TopNavbar