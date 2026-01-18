


export async function saveRating(movieId: number, rating: number) {
  
    const res = await fetch("http://localhost:3001/api/ratings", 
        {
            
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ movieId, rating })
        });
        
        if (!res.ok) {
            throw new Error("Failed to save rating");
        }
        
        return res.json();
}
