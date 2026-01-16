




const createStars = () => {

    const stars = `
    
    

    <div class="rating-container">

        <div class="rating-title-container">
            <span class="rating-title">Would you like to leave a rating?</span>

            <button class="rating-no-button">
            <svg xmlns="http://www.w3.org/2000/svg" height="34px" viewBox="0 -960 960 960" width="34px" fill="#F3F3F3"><path d="M256-181.91 181.91-256l224-224-224-224L256-778.09l224 224 224-224L778.09-704l-224 224 224 224L704-181.91l-224-224-224 224Z"/></svg>
            </button>
        </div>
        
        <div class="custom-hr"></div>

        <span class="movie-name-year">
        🎬 Movie Name (Release Year)
        </span>

        <div class="stars-div">
            <span class="star"><svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="currentColor"><path d="M333.33-259 480-347l146.67 89-39-166.67 129-112-170-15L480-709l-66.67 156.33-170 15 129 112.34-39 166.33ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-353.33Z"/></svg></span>
            <span class="star"><svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="currentColor"><path d="M333.33-259 480-347l146.67 89-39-166.67 129-112-170-15L480-709l-66.67 156.33-170 15 129 112.34-39 166.33ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-353.33Z"/></svg></span>
            <span class="star"><svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="currentColor"><path d="M333.33-259 480-347l146.67 89-39-166.67 129-112-170-15L480-709l-66.67 156.33-170 15 129 112.34-39 166.33ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-353.33Z"/></svg></span>
            <span class="star"><svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="currentColor"><path d="M333.33-259 480-347l146.67 89-39-166.67 129-112-170-15L480-709l-66.67 156.33-170 15 129 112.34-39 166.33ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-353.33Z"/></svg></span>
            <span class="star"><svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="currentColor"><path d="M333.33-259 480-347l146.67 89-39-166.67 129-112-170-15L480-709l-66.67 156.33-170 15 129 112.34-39 166.33ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-353.33Z"/></svg></span>
        </div>

        <div class="save-skip-buttons">
            <button class="save-rating">Save Rating</button>
            <span class="custom-button-hr"></span>
            <button class="skip-rating">Skip for now</button>
        </div>

    </div>`
    

    
    const starsDiv = document.createElement("div");
    starsDiv.classList.add("stars-container");

    starsDiv.innerHTML = stars

    return starsDiv
}

export default createStars