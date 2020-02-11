/**
 * Application Events
 */
const ApplicationEvents = {
  BOOK_ADDED: 'BookAdded',
  BOOK_REMOVED: 'BookRemoved',
  BOOK_STATUS_CHANGED: 'BookStatusChanged'
};

/**
 * Domain Models
 */
function Book(author, title, pages, isRead) {
  // Ensure that only a valid book can be created - UI should be able to handle these errors
  if (!author) throw 'Invalid author';
  if (!title) throw 'Invalid author';
  if (!pages || isNaN(pages) || parseInt(pages) < 1)
    throw Error('Invalid number of pages');

  this.author = author;
  this.title = title;
  this.pages = pages;
  this.isRead = isRead || false;
}

Book.prototype.info = function() {
  return `${this.title} by ${this.author}, ${
    this.pages
  } pages, ${this.readStatus()}`;
};

Book.prototype.readStatus = function() {
  return this.isRead ? 'Read' : 'Not yet read';
};

Book.prototype.toggleStatus = function() {
  this.isRead = !this.isRead;
};

/**
 * Library Specific Code
 */
const library = (function Library() {
  let books = [];
  let localStorageKey = 'catalog-jubei';
  const supportsLocalStorage = !!window.localStorage;

  /**
   * Pre-populate the library with some books
   */
  (function loadSampleBooks() {
    const sampleBooks = [
      new Book('Edward', 'Dracula 1992', 762, true),
      new Book('Edward', 'When the sun sets', 200, false),
      new Book('Fred', 'Freddy Kruggar vs Jason', 1000, true)
    ];

    sampleBooks.forEach(function(b) {
      addBookToLibrary(b);
    });
  })();

  function addBookToLibrary(newBookEntry) {
    books = [newBookEntry, ...books];
    supportsLocalStorage && syncLocalStorage();
  }

  function getCatalog() {
    return books;
  }

  function removeBook(id) {
    return new Promise(function(resolve) {
      books = books.filter(function(_, index) {
        return index !== id;
      }, []);
      supportsLocalStorage && syncLocalStorage();
      resolve();
    });
  }

  function syncLocalStorage() {
    window.localStorage.setItem(localStorageKey, JSON.stringify(books));
  }

  function toggleBookReadStatus(id) {
    return new Promise(function(resolve) {
      books = books.map(function(book, index) {
        if (index === id) {
          book.toggleStatus();
        }
        return book;
      });
      supportsLocalStorage && syncLocalStorage();
      resolve();
    });
  }

  return {
    addBook: addBookToLibrary,
    getCatalog,
    removeBook,
    toggleBookReadStatus
  };
})();

/**
 *  DOM Manipulation functions
 */
function createCell(text, isData = true, style = null) {
  const cell = isData
    ? document.createElement('td')
    : document.createElement('th');
  cell.innerHTML = text;
  if (style) {
    Object.getOwnPropertyNames(style).forEach(function(prop) {
      cell.style[prop] = style[prop];
    });
  }

  return cell;
}

function createControlButtons(bookIndex, handlers = null) {
  const { changeBookStatusHandler, removeBookHandler } = handlers;
  const removeBookButton = document.createElement('button');
  removeBookButton.innerHTML = 'Remove';
  removeBookButton.setAttribute('data-id', bookIndex);
  removeBookButton.classList.add('btn', 'btn-sm', 'btn-danger');

  if (removeBookHandler && typeof removeBookHandler === 'function') {
    removeBookButton.addEventListener('click', removeBookHandler);
  }

  const changeBookStatusButton = document.createElement('button');
  changeBookStatusButton.innerHTML = 'Change Status';
  changeBookStatusButton.setAttribute('data-id', bookIndex);
  changeBookStatusButton.classList.add('btn', 'btn-sm', 'btn-success');
  changeBookStatusButton.style.marginRight = '0.5rem';

  if (changeBookStatusHandler && typeof changeBookStatusHandler === 'function')
    changeBookStatusButton.addEventListener('click', changeBookStatusHandler);

  return [changeBookStatusButton, removeBookButton];
}

function createRow(book, id, createControlButtonsFn, handlers) {
  if (!(book instanceof Book))
    throw 'Cannot create a row for an object that is not a book';

  const tableRow = document.createElement('tr');

  const similar = ['title', 'author', 'pages'].map(prop =>
    createCell(book[prop])
  );

  const buttons = createControlButtonsFn(id, handlers);
  const buttonsCell = document.createElement('td');
  buttonsCell.append(...buttons);
  buttonsCell.style.textAlign = 'right';

  tableRow.append(
    createCell(id + 1, false),
    ...similar,
    createCell(book.readStatus(), false, { 'font-weight': 'bold' }),
    buttonsCell
  );

  return tableRow;
}

function getHTMLInputElementValueByName(rootElement, id) {
  if (!rootElement) throw Error('Invalid root element or dom node');

  if (typeof id === 'undefined' || !id) throw Error('Invalid element name');

  const element = rootElement.querySelector(`#${id}`);
  if (!(element instanceof HTMLInputElement))
    throw Error('Element is not an HTMLInputElement');

  return element.value;
}

function getBookValuesFromForm(rootElement, elementIds) {
  return elementIds.map(function(id) {
    return getHTMLInputElementValueByName(rootElement, id);
  });
}

/**
 * Cache DOM elements
 */
const root = document.getElementById('root');
const gridContainer = root.querySelector('#grid-container');
const tableBody = gridContainer.querySelector('table').querySelector('tbody');
const addBookButton = root.querySelector('#btn-add-book');
const addBookSection = root.querySelector('#section-add-book');
const isReadCheckBox = addBookSection.querySelector('#book-is-read');
const toggleFormButton = root.querySelector('#btn-toggle-add-form');

/**
 * Define Event Handlers
 */
function addBookToLibraryEventHandler(evt) {
  evt.preventDefault();
  const elementIds = [
    'book-author',
    'book-title',
    'book-total-pages',
    'book-is-read'
  ];
  const [author, title, pages, isRead] = getBookValuesFromForm(
    addBookSection,
    elementIds
  );

  try {
    const newBook = new Book(author, title, +pages, isRead === 'true');
    library.addBook(newBook);
    document.dispatchEvent(new Event(ApplicationEvents.BOOK_ADDED));
  } catch (err) {
    alert(err);
  }
}

function changeBookStatusEventHandler(evt) {
  evt.preventDefault();
  const { id } = evt.target.dataset;
  library.toggleBookReadStatus(+id);
  document.dispatchEvent(new Event(ApplicationEvents.BOOK_STATUS_CHANGED));
}

function isReadCheckBoxChangeHandler(evt) {
  evt.preventDefault();
  const isRead = isReadCheckBox.checked;
  isReadCheckBox.value = isRead;
}

function removeBookEventHandler(evt) {
  evt.preventDefault();
  const { id } = evt.target.dataset;
  library.removeBook(+id).then(function() {
    document.dispatchEvent(new Event(ApplicationEvents.BOOK_REMOVED));
  });
}
function resetBookEntryForm(formElement) {
  const elements = formElement.querySelectorAll('input');
  elements.forEach(function(ele) {
    if (ele) {
      switch (ele.type) {
        case 'text':
        case 'number':
          ele.value = '';
          break;

        case 'checkbox':
          ele.checked = false;
          break;
      }
    }
  });
}

function toggleAddBookFormVisibility() {
  const display = addBookSection.style.display;
  addBookSection.style.display = display === 'none' ? 'grid' : 'none';
  toggleFormButton.innerText =
    display === 'none' ? 'Hide Form' : 'Add Book To Catalog';
}

/**
 * Attach Event Handlers to DOM Elements
 */
addBookButton.addEventListener('click', addBookToLibraryEventHandler);
isReadCheckBox.addEventListener('change', isReadCheckBoxChangeHandler);
toggleFormButton.addEventListener('click', toggleAddBookFormVisibility);

/**
 * Render books onto the view (DOM Manipulation)
 */
function render() {
  addBookSection.style.display = 'none';
  tableBody.innerHTML = '';

  tableBody.append(
    ...library.getCatalog().map(function(book, index) {
      const handlers = {
        removeBookHandler: removeBookEventHandler,
        changeBookStatusHandler: changeBookStatusEventHandler
      };
      return createRow(book, index, createControlButtons, handlers);
    })
  );
}

document.addEventListener('DOMContentLoaded', render);
document.addEventListener(ApplicationEvents.BOOK_ADDED, render);
document.addEventListener(ApplicationEvents.BOOK_ADDED, () =>
  resetBookEntryForm(addBookSection)
);
document.addEventListener(ApplicationEvents.BOOK_REMOVED, render);
document.addEventListener(ApplicationEvents.BOOK_STATUS_CHANGED, render);
