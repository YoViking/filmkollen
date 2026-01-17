



export const saveRating = async (movieId: number, rating: number) => {


    try {
        const response = await fetch("http://localhost:3000/api/ratings", {
            
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                movieId: movieId,
                rating: rating
            })
        }) 

        if(!response.ok) {
            throw new Error("Failed to save rating")
        }
    } 
    
    catch (error) {
        console.error(error)
    }

    
}
