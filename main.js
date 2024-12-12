// JavaScript code to fulfill the tasks and extra credit requirements

// Google Books API URL
const googleBooksAPI = "https://www.googleapis.com/books/v1/volumes?q=isbn:";

// Holdings data service URL
const holdingsServiceURL = "https://gssapps.ebscohost.com/cwolf/skilltest/holdings.php";

// Fetch book covers and holdings
async function fetchBookData() {
    const entries = document.querySelectorAll('.entry');

    for (const entry of entries) {
        const isbn = entry.dataset.isbn;
        const bibid = entry.dataset.bibid;
        // Fetch and display book cover
        await fetchBookCover(isbn, entry);

        // Fetch and display holdings data
        await fetchHoldingsData(bibid, entry);

    }
}

// Fetch and display book cover from Google Books API
async function fetchBookCover(isbn, entry) {
    try {
        const response = await fetch(`${googleBooksAPI}${isbn}`);
        const data = await response.json();

        if (data.items && data.items[0].volumeInfo.imageLinks) {
            const coverDiv = entry.querySelector('.cover');
            const coverURL = data.items[0].volumeInfo.imageLinks.thumbnail;

            // Create image element and link to Google Books preview
            const img = document.createElement('img');
            img.src = coverURL;
            img.alt = 'Book Cover';

            const previewLink = document.createElement('a');
            previewLink.href = data.items[0].volumeInfo.previewLink;
            previewLink.target = '_blank';
            previewLink.appendChild(img);

            coverDiv.appendChild(previewLink);
        }
    } catch (error) {
        console.error(`Failed to fetch cover for ISBN ${isbn}:`, error);
    }
}

// Fetch and display holdings data
async function fetchHoldingsData(bibid, entry) {
    try {
        const response = await fetch(`${holdingsServiceURL}?bibid=${bibid}`);
        const data = await response.json();

        if (data.length > 0) {
            const rtacDiv = entry.querySelector('.rtac');

            // Create and populate the table
            const table = document.createElement('table');
            const thead = document.createElement('thead');
            thead.innerHTML = '<tr><th>Location</th><th>Call No.</th><th>Status</th><th>Due Date</th></tr>';
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            data.filter(item => item.status.toLowerCase() !== 'lost')
                .sort((a, b) => (a.status.toLowerCase() === 'available' ? -1 : 1))
                .slice(0, 3) // Display only the first 3 rows initially
                .forEach(item => addTableRow(tbody, item));

            table.appendChild(tbody);
            rtacDiv.appendChild(table);

            // Show all / Show less functionality
            if (data.length > 3) {
                addShowMoreLessButton(data, tbody, rtacDiv);
            }
        }
    } catch (error) {
        console.error(`Failed to fetch holdings for BIB ID ${bibid}:`, error);
    }
}

// Add a row to the table
function addTableRow(tbody, item) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${item.location}</td>
        <td>${item.callNumber}</td>
        <td>${item.status}</td>
        <td>${item.dueDate || 'N/A'}</td>
    `;
    tbody.appendChild(row);
}

// Add Show More / Show Less functionality
function addShowMoreLessButton(data, tbody, rtacDiv) {
    const button = document.createElement('button');
    button.textContent = 'Show More';

    let showingAll = false;

    button.addEventListener('click', () => {
        showingAll = !showingAll;
        tbody.innerHTML = '';

        const rowsToShow = showingAll ? data.filter(item => item.status.toLowerCase() !== 'lost') : data.filter(item => item.status.toLowerCase() !== 'lost').slice(0, 3);

        rowsToShow.forEach(item => addTableRow(tbody, item));

        button.textContent = showingAll ? 'Show Less' : 'Show More';
    });

    rtacDiv.appendChild(button);
}

// Initialize the script
fetchBookData();