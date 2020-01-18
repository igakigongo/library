/**
 * Domain Models
 */
function Book(author, title, pages, isRead){
  // Ensure that only a valid book can be created - UI should be able to handle these errors
  if (!author) throw "Invalid author";
  if (!title) throw "Invalid author";
  if (!pages || isNaN(pages) || parseInt(pages) < 1) throw Error("Invalid number of pages");

  this.author = author;
  this.title = title;
  this.pages = pages;
  this.isRead = isRead || false;
}

Book.prototype.info = function(){
  return `${this.title} by ${this.author}, ${this.pages} pages, ${this.readStatus()}`;
};

Book.prototype.readStatus = function(){
  return this.isRead? "Read": "Not yet read";
};

/**
 * Library Specific Code
 */
const library  = (function Library(){
  const books = [];

  function addBookToLibrary(newBookEntry){
    books.unshift(newBookEntry);
  }

  function getCatalog(){
    return books;
  }

  return {
    addBookToLibrary,
    getCatalog
  };
})();

/**
 * Prepopulate the array with some books
 * Consider this to be something similar to an API call
 */
function loadSampleBooks() {
  return new Promise(function(resolve){
    [new Book("Edward", "Dracula 1992", 762, true), new Book("Edward", "When the sun sets", 200, false),
      new Book("Fred", "Freddy Kruggar vs Jason", 1000, true)].forEach(function(b){
      library.addBookToLibrary(b);
      resolve("Initialized Library");    
    });
  });
}

loadSampleBooks().then(console.log);

/**
 *  DOM Manipulation functions
 */
function createCell(text, isData = true, style = null){
  const cell = isData ? document.createElement("td"): document.createElement("th");
  cell.innerHTML = text;
  if (style){
    Object.getOwnPropertyNames(style).forEach(function(prop){
      cell.style[prop] = style[prop];
    });
  }

  return cell;
}

function createRow(book, id){
  if (!(book instanceof Book))
    throw Error("Cannot create a row for an object that is not a book");

  console.log("we have a book instance");
  const tableRow = document.createElement("tr");

  const similar = ["title", "author", "pages"]
    .map(prop => createCell(book[prop]),);

  tableRow.append(createCell(id, false), ...similar, 
    createCell(book.readStatus(), false, { "font-weight": "bold" }), 
    createCell("", true, { "text-align": "right"}));
  
  return tableRow;
}

function getHTMLInputElementValueByName(rootElement, id){
  if (!rootElement)
    throw Error("Invalid root element or dom node");

  if (typeof id === "undefined" || !id)
    throw Error("Invalid element name");

  const element = rootElement.querySelector(`#${id}`);
  if (!(element instanceof HTMLInputElement))
    throw Error("Element is not an HTMLInputElement");
  
  return element.value;
}

function getBookValuesFromForm(rootElement, elementIds){
  return elementIds.map(function(id){
    return getHTMLInputElementValueByName(rootElement, id);
  });
}

/**
 * Cache DOM elements
 */
const root = document.getElementById("root");
const gridContainer = root.querySelector("#grid-container");
const tableBody =  gridContainer.querySelector("table").querySelector("tbody");
const addBookButton = root.querySelector("#btn-add-book");
const addBookSection = root.querySelector("#section-add-book");
const isReadCheckBox = addBookSection.querySelector("#book-is-read");

/**
 * Define Event Handlers
 */
function addBookToLibraryEventHandler(evt){
  evt.preventDefault();
  
  const elementIds = ["book-author", "book-title", "book-total-pages", "book-is-read"];
  const [author, title, pages, isRead] = getBookValuesFromForm(addBookSection, elementIds);

  try{
    const newBook = new Book(author, title, +pages, isRead === "true");
    library.addBookToLibrary(newBook);
    resetBookEntryForm(addBookSection);
    render();
  }catch(err){
    alert(err);
  }
}

function isReadCheckBoxChangeHandler(evt){
  evt.preventDefault();
  const isRead = isReadCheckBox.checked;
  isReadCheckBox.value = isRead;
}

function resetBookEntryForm(formElement){
  console.log(formElement);
  ["book-author", "book-title", "book-total-pages", "book-is-read"].forEach(function(id){
    const ele = formElement.querySelector(`#${id}`);
    if (ele){
      switch(ele.type){
      case "text":
      case "number":
        ele.value = "";
        break;

      case "checkbox":
        ele.checked = false;
        break;
      }
    }
  });
}

/**
 * Attach Event Handlers to DOM Elements
 */
addBookButton.addEventListener("click", addBookToLibraryEventHandler);
isReadCheckBox.addEventListener("change", isReadCheckBoxChangeHandler);

/**
 * Render books onto the view (DOM Manipulation)
 */
function render(){

  tableBody.innerHTML = "";
  tableBody.append(...library.getCatalog().map(function(book, index){
    return createRow(book, index + 1);
  }));

  // const btn = document.createElement("button", {});
}

