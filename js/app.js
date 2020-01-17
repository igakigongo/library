/**
 * Library Specific Code
 */
let myLibrary = [];

function Book(author, title, pages, isRead){
  this.author = author;
  this.title = title;
  this.pages = pages;
  this.isRead = isRead;
}

Book.prototype.info = function(){
  return `${this.title} by ${this.author}, ${this.pages} pages, ${this.isRead ? "already read": "not yet read"}`;
};

Book.prototype.readStatus = function(){
  return this.isRead? "Already read": "Not yet read";
};

function addBookToLibrary(book){
  myLibrary.unshift(book);
}

/**
 *  DOM Helper functions
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


  tableRow.append(createCell(id, false), ...similar, createCell(book.readStatus(), false, { "font-weight": "bold" }), 
    createCell("", true, { "text-align": "right"}));
  
  return tableRow;
}

/**
 * Prepopulate the array with some books
 */
(function(){
  addBookToLibrary(new Book("Edward", "Dracula 1992", 762, true));
  addBookToLibrary(new Book("Edward", "When the sun sets", 200, false));
  addBookToLibrary(new Book("Fred", "Freddy vs Kruggar", 1000, true));
  console.log("Initialized Library", myLibrary);
})();


/**
 * Cache DOM elements
 */

const root = document.getElementById("root");
const gridContainer = root.querySelector("#grid-container");
const tableBody =  gridContainer.querySelector("table").querySelector("tbody");


/**
 * Render books onto the view (DOM Manipulation)
 */
(function render(){

  myLibrary.forEach(function(book, index){
    const tableRow = createRow(book, index + 1);
    tableBody.append(tableRow);
  });

  const btn = document.createElement("button", {});
  console.log(btn);
})();