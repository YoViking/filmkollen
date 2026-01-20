

import { saveRating } from "../services/movieApi";


export const modal = () => {

    
    const stars = `
    
    <div class="rating-modal">
        <div class="rating-container">

            <div class="rating-title-container">
                <span class="rating-title">Would you like to leave a rating?</span>

                <button class="rating-no-button">
                <svg xmlns="http://www.w3.org/2000/svg" height="34px" viewBox="0 -960 960 960" width="34px" fill="currentColor"><path d="M256-181.91 181.91-256l224-224-224-224L256-778.09l224 224 224-224L778.09-704l-224 224 224 224L704-181.91l-224-224-224 224Z"/></svg>
                </button>
            </div>
            
            <div class="custom-hr"></div>

            <span class="movie-name-year">
             
            </span>


            <div class="stars-div">
            
                <label class="star">
                    <input type="radio" name="rating" value="1">
                    <i class="fa-regular fa-star"></i>
                </label>

                <label class="star">
                    <input type="radio" name="rating" value="2">
                    <i class="fa-regular fa-star"></i>
                </label>

                <label class="star">
                    <input type="radio" name="rating" value="3">
                    <i class="fa-regular fa-star"></i>
                </label>

                <label class="star">
                    <input type="radio" name="rating" value="4">
                    <i class="fa-regular fa-star"></i>
                </label>

                <label class="star">
                    <input type="radio" name="rating" value="5">
                    <i class="fa-regular fa-star"></i>
                </label>

                <label class="star">
                    <input type="radio" name="rating" value="6">
                    <i class="fa-regular fa-star"></i>
                </label>

                <label class="star">
                    <input type="radio" name="rating" value="7">
                    <i class="fa-regular fa-star"></i>
                </label>
                
                <label class="star">
                    <input type="radio" name="rating" value="8">
                    <i class="fa-regular fa-star"></i>
                </label>

                <label class="star">
                    <input type="radio" name="rating" value="9">
                    <i class="fa-regular fa-star"></i>
                </label>

                <label class="star">
                    <input type="radio" name="rating" value="10">
                    <i class="fa-regular fa-star"></i>
                </label>
            
            </div>


            <div class="save-skip-buttons">
                <button class="save-rating">Save Rating</button>
                <span class="custom-button-hr"></span>
                <button class="skip-rating">Skip for now</button>
            </div>
            

        </div>
    </div>`


    const ratingDiv = document.createElement("div");

    ratingDiv.classList.add("rating-div-container");
    ratingDiv.innerHTML = stars;

    showModal();


    return ratingDiv;
}




let movieId: number

export const showModal = () => {

    const rateButton = document.querySelectorAll(".movie-card__rate-btn"); 

    rateButton.forEach(button => {

        button.addEventListener("click", () => {
            
            const movieCard = button.closest(".movie-card") as HTMLElement 

            if(!movieCard) return

            movieId = Number(movieCard.dataset.movieId)
            
            const movieTitle = movieCard.querySelector(".movie-card__title");
            const movieReleaseYear = movieCard.querySelector(".movie-card__year");
            const nameYearTitle = document.querySelector(".movie-name-year");

            
            if(nameYearTitle) {
                nameYearTitle.textContent = `🎬 ${movieTitle?.textContent} 
                (${movieReleaseYear?.textContent.split(": ")[1]})`
            }


            const modal = document.querySelector(".rating-modal");
            modal?.classList.add("show-modal");

            starRating()
            collectRating()
            closeModal()
            
        })

    })
}





const closeModal = () => {

    const modal = document.querySelector(".rating-modal");

    document.querySelector(".rating-no-button")?.addEventListener("click", () => {
        modal?.classList.remove("show-modal")
    })

    document.querySelector(".skip-rating")?.addEventListener("click", () => {
        modal?.classList.remove("show-modal")
    })

    document.querySelector(".save-rating")?.addEventListener("click", () => {
        modal?.classList.remove("show-modal")
    })
}





let rating = 0;

const starRating = () => {

    const starIcon = document.querySelectorAll<HTMLElement>(".fa-star");

    starIcon.forEach((star, index1) => {
        star.addEventListener("click", () => {
            starIcon.forEach((star, index2) => {

                rating = index1 + 1

                if (index1 >= index2) {
                    star.classList.remove("fa-regular");
                    star.classList.add("fa-solid");
                }

                else {
                    star.classList.remove("fa-solid");
                    star.classList.add("fa-regular");
                }
            })
        })
    })
}



const collectRating = () => {

    const saveRatingButton = document.querySelector(".save-rating") as HTMLButtonElement

    if (!saveRatingButton) return;

    saveRatingButton.onclick = () => {
        saveRating(movieId, rating)
    }
}
