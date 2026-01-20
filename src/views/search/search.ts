import { getGenres } from '../../services/tmdbApi';
// @ts-ignore
import searchHtml from './search.html?raw';
import './search.css';

export const renderFilterComponent = async (
    onSearch: (params: { title: string, year: string, rating: string, genre: string }) => void, 
    onCancel: () => void
) => {
    const genres = await getGenres();
    const currentYear = new Date().getFullYear();

    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = searchHtml;
    const view = tempContainer.firstElementChild as HTMLElement;

    // Referenser till ALLA dropdowns
    const yearSelect = view.querySelector('#filter-year') as HTMLSelectElement;
    const ratingSelect = view.querySelector('#filter-rating') as HTMLSelectElement;
    const genreSelect = view.querySelector('#filter-genre') as HTMLSelectElement;
    const titleInput = view.querySelector('#filter-title-search') as HTMLInputElement;
    const executeBtn = view.querySelector('#btn-execute-filter') as HTMLButtonElement;
    const cancelBtn = view.querySelector('#btn-cancel-filter') as HTMLButtonElement;

    // Populera Year och Genre direkt
    yearSelect.innerHTML = `<option value="">Välj år/period</option>` + 
        Array.from({length: currentYear - 2009}, (_, i) => `<option value="${currentYear - i}">${currentYear - i}</option>`).join('') +
        `<option value="2000-2010">2000-2010</option><option value="1990-2000">1990-2000</option><option value="1980-1990">1980-1990</option>`;
    
    genreSelect.innerHTML = `<option value="">Alla genrer</option>` + 
        genres.map(g => `<option value="${g.id}">${g.name}</option>`).join('');

    // Sökknappen enablas om MINST ett filter eller text används
    const checkInputs = () => {
        const hasText = titleInput.value.trim().length >= 2;
        const hasYear = yearSelect.value !== "";
        const hasRating = ratingSelect.value !== "";
        const hasGenre = genreSelect.value !== "";
        
        executeBtn.disabled = !(hasText || hasYear || hasRating || hasGenre);
    };

    [titleInput, yearSelect, ratingSelect, genreSelect].forEach(el => {
        el.addEventListener('input', checkInputs);
        el.addEventListener('change', checkInputs);
    });

    executeBtn.addEventListener('click', () => {
        onSearch({
            title: titleInput.value.trim(),
            year: yearSelect.value,
            rating: ratingSelect.value,
            genre: genreSelect.value
        });
    });

    cancelBtn.addEventListener('click', onCancel);

    return view;
};