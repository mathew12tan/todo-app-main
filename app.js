// theme
const themeBtn = document.querySelector(".theme-btn");
themeBtn.addEventListener("click", function () {
    document.querySelector("body").classList.toggle("dark-theme");
})

// query selectors
const inputForm = document.querySelector(".input-form");
const todoInput = document.querySelector("#todo");
const submitBtn = document.querySelector(".submit-btn");
const listContainer = document.querySelector(".list-container");
const list = document.querySelector(".list");
const clearBtn = document.querySelector(".clear-btn");
const itemleft = document.querySelector(".item-left");
const message = document.querySelector(".message");
const filterBtns = document.querySelectorAll(".filter-btn");

// edit options
let editElement;
let editFlag = false;
let editID = "";

// event listeners
inputForm.addEventListener("submit", addItem);
clearBtn.addEventListener("click", clearItems);
window.addEventListener("DOMContentLoaded", setupItems);

filterBtns.forEach(btn => {
    btn.addEventListener('click', function (e) {
        filterBtns.forEach(element => {
            element.classList.remove("selected");
        });
        e.currentTarget.classList.add("selected");
        list.innerHTML = "";
        let items = getLocalStorage();
        const type = e.currentTarget.getAttribute("data-type");
        const filterItems = items.filter(item => item.status === type);
        type === "all" ?
            items.forEach(item => {
                createListItem(item.id, item.value, item.status);
                inputForm.classList.remove("deactivate");
                list.setAttribute("ondragstart", "")
                message.textContent = "Drag and drop to reorder list";
            }) :
            filterItems.forEach(filterItem=> {
                createListItem(filterItem.id, filterItem.value, filterItem.status);
                inputForm.classList.add("deactivate");
                list.setAttribute("ondragstart", "return false")
                message.textContent = "Drag and drop disabled";
            });
    });
})

list.addEventListener("dragend", function (e) {
    e.preventDefault();
    let items = getLocalStorage();
    items = [];
    for (let index = 0; index < list.children.length; index++) {
        let id = list.children[index].getAttribute("data-id");
        let value = list.children[index].querySelector(".item").innerHTML;
        let status = list.children[index].getAttribute("data-status");
        const item = { id, value, status };
        items.push(item);
    }
    localStorage.setItem("list", JSON.stringify(items));
})

// functions
function addItem(e) {
    e.preventDefault();
    const value = todoInput.value;
    const id = new Date().getTime().toString();
    submitBtn.classList.add("completed");
    setTimeout(function () {
        submitBtn.classList.remove("completed");
    }, 400)

    if (value && !editFlag) {
        const status = "active";
        createListItem(id, value, status);
        listContainer.classList.add("show-container");
        displayAlert("Item added successfully");
        addToLocalStorage(id, value, status);
        setBackToDefault();
    } else if (value && editFlag) {
        const status = editElement.parentElement.getAttribute("data-status");
        editElement.innerHTML = value;
        displayAlert("Item edited successfully");
        editLocalStorage(editID, value, status);
        setBackToDefault();
    } else {
        displayAlert("Please enter an item");
    }
    itemQty();
}

function setBackToDefault() {
    todoInput.value = "";
    editFlag = false;
    editID = "";
}

function displayAlert(text) {
    message.textContent = text;
    message.classList.add("alert");
    setTimeout(function () {
        message.textContent = "Drag and drop to reorder list";
        message.classList.remove("alert");
    }, 1200);
}

function clearItems() {
    const items = document.querySelectorAll(".item-div");
    items.forEach(item => {
        let status = item.getAttribute("data-status");
        let id = item.dataset.id;
        status === "completed" ?
            (list.removeChild(item), displayAlert("Completed item cleared"), removeFromLocalStorage(id)) :
            displayAlert("No completed item to clear");
    });
    itemQty();
    setBackToDefault();
}

function editItem(e) {
    const element = e.currentTarget.parentElement.parentElement;
    editElement = element.querySelector(".item");
    todoInput.value = editElement.innerHTML;
    editFlag = true;
    editID = element.dataset.id;
}

function deleteItem(e) {
    const element = e.currentTarget.parentElement.parentElement;
    const id = element.dataset.id;
    list.removeChild(element);
    list.children.length === 0
        ? listContainer.classList.remove("show-container")
        : "";
    displayAlert("Item deleted successfully");
    removeFromLocalStorage(id);
    setBackToDefault();
    itemQty();
}

function checkItem(e) {
    const element = e.currentTarget.parentElement;
    const id = element.dataset.id;
    const value = element.querySelector(".item").innerHTML;
    const editBtn = element.querySelector(".edit-btn");
    const checkBtn = element.querySelector(".check-btn");
    const item = element.querySelector(".item");

    checkBtn.classList.toggle("completed");
    item.classList.toggle("checked");

    let status = element.getAttribute("data-status");
    status === "active" ?
        (element.setAttribute("data-status", "completed"), displayAlert("Item is completed"), editLocalStorage(id, value, "completed"), editBtn.disabled = true) :
        (element.setAttribute("data-status", "active"), displayAlert("Item is active"), editLocalStorage(id, value, "active"), editBtn.disabled = false);
}

function itemQty() {
    let items = getLocalStorage();
    itemleft.textContent = `${items.length} items left`;
}

// local storage
function addToLocalStorage(id, value, status) {
    const item = { id, value, status };
    let items = getLocalStorage();
    items.push(item);
    localStorage.setItem("list", JSON.stringify(items));
}

function getLocalStorage() {
    return localStorage.getItem("list")
        ? JSON.parse(localStorage.getItem("list"))
        : [];
}

function editLocalStorage(id, value, status) {
    let items = getLocalStorage();
    items = items.map(function (item) {
        if (item.id === id) {
            item.value = value;
            item.status = status;
        }
        return item;
    });
    localStorage.setItem("list", JSON.stringify(items));
}

function removeFromLocalStorage(id) {
    let items = getLocalStorage();
    items = items.filter(function (item) {
        if (item.id !== id) {
            return item;
        }
    });
    localStorage.setItem("list", JSON.stringify(items));
}

// setup items
function setupItems() {
    let items = getLocalStorage();
    if (items.length > 0) {
        items.forEach((item) => {
            createListItem(item.id, item.value, item.status);
        });
    }
    itemQty();
}

function createListItem(id, value, status) {
    const element = document.createElement("div");
    element.classList.add("item-div");
    element.setAttribute("data-id", id);
    element.setAttribute("data-status", status);
    element.setAttribute("draggable", "true");
    let checked = "";
    let btnStatus = "";
    if (status === "completed") {
        checked = "checked";
        btnStatus = "disabled";
    }
    element.innerHTML =
        `<button class="check-btn interactive-btn ${status}"><img class="check-img" src="./images/icon-check.svg" alt="icon-check"><span></span></button>
        <p class="item ${checked}">${value}</p>
        <div class="item-btns">
            <button class="edit-btn" ${btnStatus}><i class="far fa-edit"></i></button>
            <button class="delete-btn"><img src="./images/icon-cross.svg" alt="icon-cross"></button>
        </div>`;
    const editBtn = element.querySelector(".edit-btn");
    const deleteBtn = element.querySelector(".delete-btn");
    const checkBtn = element.querySelector(".check-btn");
    editBtn.addEventListener("click", editItem);
    deleteBtn.addEventListener("click", deleteItem);
    checkBtn.addEventListener("click", checkItem);
    list.appendChild(element);

    // drag and drop
    const draggables = document.querySelectorAll(".item-div");
    draggables.forEach(draggable => {
        draggable.addEventListener("dragstart", (e) => {
            draggable.classList.add("dragging");
        })
        draggable.addEventListener("dragend", () => {
            draggable.classList.remove("dragging");
        })
    });

    draggables.forEach(element => {
        element.addEventListener("dragover", function (e) {
            e.preventDefault();
            let dragItem = list.querySelector(".dragging");
            let refItem = e.currentTarget;
            const box = dragItem.getBoundingClientRect();
            const position = e.clientY - box.top - box.height / 2
            position > 0 ?
                list.insertBefore(refItem, dragItem) :
                list.insertBefore(dragItem, refItem);
        })
    });
}





