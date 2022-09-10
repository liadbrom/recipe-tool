let elDropZone;
let elRecipesContainer;
let elPrintBtn;
let fileCounter = 0;
const A5_PAPER_HEIGHT_MM = 210.7;

window.addEventListener('load', () => {
    elDropZone = document.getElementById('drop-zone');
    elRecipesContainer = document.getElementById('recipes-container');
    elPrintBtn = document.getElementById('print-btn');
});

const dropHandler = e => {
    e.preventDefault();

    if (e.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        [...e.dataTransfer.items].filter(item => item.kind === 'file').forEach((item, i) => {
            const file = item.getAsFile();
            if (file.type === 'text/html') {
                fileCounter++;
                const fr = new FileReader();
                fr.readAsText(file);
                fr.onload = () => {
                    const newSection = document.createElement('section');
                    newSection.setAttribute('contenteditable', 'true');
                    newSection.innerHTML = `${fr.result}`;
                    injectLinkToTitle(newSection);
                    translateHeaders(newSection);
                    newSection.querySelector('p img').parentElement.remove();
                    const ingredientsContainer = extractIngredientsHeader(newSection);

                    const elActionPanel = createActionsPanel();
                    elActionPanel.appendChild(createRemoveBtn());
                    elActionPanel.appendChild(createSplitBtn());
                    elActionPanel.appendChild(createColumnBtn(ingredientsContainer));
                    newSection.appendChild(elActionPanel);

                    elRecipesContainer.appendChild(newSection);
                }
            }
        });
        if (fileCounter) {
            elDropZone.style.display = 'none';
            elPrintBtn.style.display = 'block';
            elPrintBtn.addEventListener('click', () => window.print());
            document.body.style.padding = 0;
            elRecipesContainer.style.maxHeight = (fileCounter * A5_PAPER_HEIGHT_MM) - 1 + 'mm';
        }
    }
}

const dragOverHandler = e => {
    e.preventDefault();
}

const injectLinkToTitle = (newSection) => {
    const recipeLink = newSection.getElementsByTagName('a')[0].getAttribute('href');
    newSection.getElementsByTagName('a')[0].remove();
    const elRecipeTitle = newSection.querySelector('[itemprop="name"]');
    elRecipeTitle.innerHTML = `<a href=${recipeLink} target='_blank'>${elRecipeTitle.innerHTML}</a>`;
}

const translateHeaders = (newSection) => {
    Array.from(newSection.getElementsByTagName('h3')).forEach(header => {
        if (header.innerHTML === 'Ingredients') {
            header.innerHTML = 'מצרכים';
        } else if (header.innerHTML === 'Recipe') {
            header.innerHTML = 'הוראות הכנה'
        }
    });
}

const extractIngredientsHeader = (newSection) => {
    const IngredientsContainer = newSection.querySelector('[itemprop="recipeIngredient"]');
    const header = IngredientsContainer.getElementsByTagName('h3')[0].cloneNode(true);
    IngredientsContainer.getElementsByTagName('h3')[0].remove();
    newSection.insertBefore(header, IngredientsContainer);
    return IngredientsContainer;
}

const createActionsPanel = () => {
    const container = document.createElement('div');
    container.className = 'actions-panel';
    return container;
}

const createRemoveBtn = () => {
    const removeBtn = document.createElement('button');
    removeBtn.className = 'action-btn';
    removeBtn.textContent = 'remove';
    removeBtn.addEventListener('click', (e) => e.target.parentElement.parentElement.remove());
    return removeBtn;
}

const createSplitBtn = () => {
    const splitBtn = document.createElement('button');
    splitBtn.className = 'split-btn action-btn';
    splitBtn.addEventListener('click', (e) => e.target.parentElement.parentElement.classList.toggle('split'));
    return splitBtn;
}

const createColumnBtn = (ingredientsContainer) => {
    const columnBtn = document.createElement('button');
    const columnInput = document.createElement('input');
    columnInput.setAttribute('type', 'number');
    columnInput.setAttribute('min', 1);
    columnInput.setAttribute('max', 3);
    columnInput.setAttribute('value', 1);
    columnBtn.className = 'column-btn action-btn';
    columnBtn.textContent = 'columns ';
    columnInput.addEventListener('input', (e) => {
        ingredientsContainer.style.setProperty('--column-count', e.target.value);
    });
    columnBtn.appendChild(columnInput);
    return columnBtn;
}