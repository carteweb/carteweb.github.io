// Get the file name from the URL parameter (e.g., ?file=books/book1.pdf)
const urlParams = new URLSearchParams(window.location.search);
const file = urlParams.get('file');

if (!file) {
    alert("No book selected! returning to library.");
    window.location.href = 'index.html';
}

const bookContainer = document.getElementById('book');
const pageCountSpan = document.getElementById('page-count');
let pdfDoc = null;

// Initialize the Flipbook (St.PageFlip)
// We set width/height to match a standard book ratio
const pageFlip = new St.PageFlip(bookContainer, {
    width: 550, // Width of one page
    height: 750, // Height of one page
    size: 'stretch',
    minWidth: 315,
    maxWidth: 1000,
    minHeight: 420,
    maxHeight: 1350,
    maxShadowOpacity: 0.5,
    showCover: true,
    mobileScrollSupport: false // Disable default scroll to rely on flip
});

// Load the PDF
pdfjsLib.getDocument(file).promise.then(pdf => {
    pdfDoc = pdf;
    pageCountSpan.innerText = `Pages: ${pdf.numPages}`;
    renderAllPages(pdf);
}).catch(err => {
    console.error('Error loading PDF:', err);
    alert('Could not load the book. Check the console for details.');
});

async function renderAllPages(pdf) {
    const pages = [];
    
    // Loop through all pages
    for (let i = 1; i <= pdf.numPages; i++) {
        // Create a wrapper div for each page
        const pageDiv = document.createElement('div');
        pageDiv.className = 'page';
        
        // This is a placeholder; we will render the canvas inside
        pageDiv.innerHTML = `
            <div class="page-content">
                <canvas id="canvas-${i}"></canvas>
            </div>
        `;
        bookContainer.appendChild(pageDiv);
        pages.push(i);
    }

    // Initialize the flipbook with the created DOM elements
    pageFlip.loadFromHTML(document.querySelectorAll('.page'));

    // Render the actual PDF content onto the Canvases *after* Flip is ready
    // We do this to ensure dimensions are set roughly correctly
    for (let i of pages) {
        renderPage(i);
    }
    
    // Try to get chapters (bookmarks)
    setupOutline();
}

async function renderPage(pageNum) {
    const page = await pdfDoc.getPage(pageNum);
    const canvas = document.getElementById(`canvas-${pageNum}`);
    const ctx = canvas.getContext('2d');

    // Adjust scale for better quality (2.0 = sharp text)
    const viewport = page.getViewport({ scale: 1.5 });
    
    // Set canvas dimensions to match the PDF page
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Make the canvas fit inside the page div nicely
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    const renderContext = {
        canvasContext: ctx,
        viewport: viewport
    };
    
    page.render(renderContext);
}

// Function to handle Table of Contents / Chapters
function setupOutline() {
    pdfDoc.getOutline().then(outline => {
        const list = document.getElementById('chapter-list');
        const sidebar = document.getElementById('sidebar');

        if (!outline || outline.length === 0) {
            // No chapters found in PDF structure
            return; 
        }

        // Show sidebar automatically if chapters exist (or add a toggle button)
        sidebar.classList.add('active');

        outline.forEach(item => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.innerText = item.title;
            a.href = "#";
            a.style.display = "block";
            a.style.padding = "5px 0";
            
            // Note: Handling PDF destinations is complex. 
            // This is a simplified approach assuming 'dest' leads to a page ref.
            // In a robust app, you need to map dest -> pageIndex -> flip to page.
            
            li.appendChild(a);
            list.appendChild(li);
        });
    }).catch(err => console.log("No outline found"));
}
