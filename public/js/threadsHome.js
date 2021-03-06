"use strict";

const id = _id => document.getElementById(_id);
let local_items = [];

document.querySelector("body").onload = main;

function main() {
    const isVerifiedStr = localStorage.getItem("isVerified");
    if (isVerifiedStr) {
        const isVerified = JSON.parse(isVerifiedStr);
        const now = new Date;
        if (now.getTime() < isVerified.expiry + (12 * 60 * 60 * 1000)) //12 hours in ms
            renderVerifiedPage();
        else 
            logout();
    }
    getThreadItems();
}

function renderVerifiedPage() {
    let loginLink = id('loginLink');
    let accountLink = id('accountLink');
    loginLink.innerHTML = "Logout";
    loginLink.removeAttribute("href");
    loginLink.setAttribute("onclick", "logout()");
    accountLink.innerHTML = "Account";
    accountLink.setAttribute("href", "../account");
    loginLink.onclick = function() { logout() };
}

function logout() {
    localStorage.removeItem('isVerified');
    localStorage.removeItem('username');
    fetch("http://52.162.249.144/logout", {
        method: "get"
    }).then( async res => {
        if (res.status === 200) {
            alert('Successfully Logged Out');
            window.location = '/threadsHome';
        }
    }).catch( err => {
        console.log(err);
    });
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
        button.textContent = local_items[i].title + " by " + local_items[i].username;
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
