"use strict";

const id = _id => document.getElementById(_id);
let local_items = [];

document.querySelector("body").onload = main;

function main() {
    getThreadItems();
}

function doSomething (event, i) {
    console.log(i);
    localStorage.setItem("threadID", i);
    window.location.href = "http://52.162.249.144/threads";
}

function render() {
    const template = id('thread-item-template');
    let list_elt = id('thread-list');
    list_elt.innerHTML = '';
    for (let i = 0; i < local_items.length; ++i) {
        let new_li = document.importNode(template.content, true);
        const button = new_li.querySelector('.thread-item-title');
        button.textContent = local_items[i].title;
        button.setAttribute('id', local_items[i].id);
        list_elt.appendChild(new_li);
    }
    for (let i = 1; i <= local_items.length; ++i) {
        document.getElementById(i).onclick = event => {
            doSomething(event, i);
        }
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
