"use strict";

const id = _id => document.getElementById(_id);
let local_items = [];

document.querySelector("body").onload = main;

function main() {
    getThreadItems();
    console.log("Test1");
    document.getElementById("thread-item-title-button").onclick = (event) => {
        console.log("Test2");
        event.preventDefault();
        doSomething(event);
        console.log("Test3");
        return false;
    };
}

function render() {
    const template = id('thread-item-template');
    let list_elt = id('thread-list');
    list_elt.innerHTML = '';
    for (let i = 0; i < local_items.length; ++i) {
        let new_li = document.importNode(template.content, true);
        new_li.querySelector('.thread-item-title').textContent = local_items[i].title;
        list_elt.appendChild(new_li);
    }
}

function getThreadItems () {
    fetch('http://52.162.249.144/thread_items', {
        method: 'GET'
    }).then( res => {
        console.log(res)
        return res.json();
    }).then( data => {
        // log the data
        console.log(data);
        // overwrite local_items with the array of todont items
        // recieved from the server
        local_items = data.thread_items;
        // render the list of items received from the server
        render();
    }).catch( err => {
        console.log(err);
    });
}

function doSomething (event) {
    console.log("Test4");
}