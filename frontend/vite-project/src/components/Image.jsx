import { useEffect, useRef } from "react"

const LazyImage = ({src}) => {

    
    const ref = useRef()

    let callback = (entries, observer) => {
        entries.forEach((entry) => {
            console.log(entry);
        })
    }

    useEffect(() => {
        let observer = new IntersectionObserver(callback)

        if(ref?.current) {
            observer.observe(ref.current)
        }

        return () => {
            observer.disconnect()
        }
    },[])

    return <img ref={ref} src={src} alt="" className={"mt-5 rounded w-full"} />
}


export default LazyImage