const urlParams = new URLSearchParams(window.location.search);
const bookUrl = urlParams.get('file');

if (!file) {
    alert("Eroare1");
    window.location.href = 'index.html';
}

const bookContainer = document.getElementById('book');
const titleSpan = document.getElementById('book-title');

// Settings d l-page flip
const pageFlip = new St.PageFlip(bookContainer, {
    width: 550, 
    height: 733,
    size: 'stretch',
    minWidth: 315,
    maxWidth: 1000,
    minHeight: 420,
    maxHeight: 1350,
    maxShadowOpacity: 0.5,
    showCover: true,
});

// Had fonction katjib l-HTML file w kat-processih
fetch(bookUrl)
    .then(response => response.text())
    .then(html => {
        // Nsawbo parser bach nqraw l-contenu d l-file
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Nhemiw l-content (paragraphs, headings...)
        // Kanfترضo anna l-ktab fih <p> wla <div> elements
        const elements = Array.from(doc.body.children);
        
        organizePages(elements);
        titleSpan.innerText = "Enjoy Reading";
    })
    .catch(err => {
        console.error(err);
        alert("Eroare2");
    });

function organizePages(contentElements) {
    let currentPage = createPageElement();
    let contentBox = currentPage.querySelector('.page-content');
    bookContainer.appendChild(currentPage);

    // Loop ela koul element (paragraph, titre...)
    contentElements.forEach(el => {
        // Nkhleqo copy d l-element
        const clone = el.cloneNode(true);
        contentBox.appendChild(clone);

        // Checko wach l-page 3mrat (l-height fat l-qyas)
        // 650 hwa l-height taqriban li khellina l l-ktba (733 total - margins)
        if (contentBox.scrollHeight > 650) {
            // Ila fatet l-hd, hyyed l-element lakher
            contentBox.removeChild(clone);
            
            // Sayeb page jdida
            currentPage = createPageElement();
            contentBox = currentPage.querySelector('.page-content');
            bookContainer.appendChild(currentPage);
            
            // 3awd het l-element f l-page jdida
            contentBox.appendChild(clone);
        }
    });

    // L-pages tqado, db n-lanciow l-flip effect
    pageFlip.loadFromHTML(document.querySelectorAll('.page'));
}

function createPageElement() {
    const div = document.createElement('div');
    div.className = 'page';
    div.innerHTML = `
        <div class="page-content" style="padding: 40px; height: 100%; box-sizing: border-box; overflow: hidden;">
        </div>
        <div class="page-footer" style="position: absolute; bottom: 10px; width: 100%; text-align: center; color: #888;">
           •
        </div>
    `;
    return div;
}
