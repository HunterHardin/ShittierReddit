"use strict";

const id = _id => document.getElementById(_id);
let local_item;
let local_comments = [];

document.querySelector("body").onload = main;

function main() {
    let threadID = localStorage.getItem("threadID");
    console.log(threadID);
    getThreadItem(threadID);
    getComments(threadID);
    document.getElementById("thread-comment-form").onsubmit = (event) => {
        processForm(event, threadID);
        window.location.reload();
        return false;
    };
}

function render(threadID) {
    let title = id('thread-title');
    let content = id('thread-content');
    title.innerHTML = local_item.title + " by " + local_item.username;
    content.innerHTML = local_item.content;
    
    console.log(local_comments[0].comment);
    const template = id('comment-item-template');
    let list_elt = id('comment-list');
    list_elt.innerHTML = '';
    for (let i = 0; i < local_comments.length; ++i) {
        let new_li = document.importNode(template.content, true);
        new_li.querySelector('.comment-creator').textContent = local_comments[i].username;
        new_li.querySelector('.comment-item-text').textContent = local_comments[i].comment;
        list_elt.appendChild(new_li);
    }
}

function getThreadItem (threadID) {
    const data = {
        id: threadID
    };
    fetch("http://52.162.249.144/thread", {
        method: "post",
        body: JSON.stringify(data),
        headers: {"Content-Type": "application/json"}
    }).then( res => {
        console.log(res)
        return res.json();
    }).then( data => {
        console.log(data);
        local_item = data.thread_items;
    }).catch( err => {
        console.log(err);
    });
}

function getComments (threadID) {
    const data = {
        id: threadID
    };
    fetch("http://52.162.249.144/comments", {
        method: "post",
        body: JSON.stringify(data),
        headers: {"Content-Type": "application/json"}
    }).then( res => {
        console.log(res)
        return res.json();
    }).then( data => {
        console.log(data);
        local_comments = data.comment_items;
        render(threadID);
    }).catch( err => {
        console.log(err);
    });
}

async function processForm (event, threadID) {
    const comment = document.getElementById("thread-comment").value;
    console.log(`New Thread: ${comment}`);
    const data = {
        threadID: threadID,
        comment: comment
    };
    
    fetch("http://52.162.249.144/createComment", {
        method: "post",
        body: JSON.stringify(data),
        headers: {"Content-Type": "application/json"}
    }).then( res => {
        return res.json();
    }).then( data => {
        console.log(data);
    }).catch( err => {
        console.log(err);
    });
}