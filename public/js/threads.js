"use strict";

const id = _id => document.getElementById(_id);
let local_item;
let local_comments = [];

document.querySelector("body").onload = main;

function main() {
    const isVerifiedStr = localStorage.getItem("isVerified");
    if (isVerifiedStr) {
        const isVerified = JSON.parse(isVerifiedStr);
        const now = new Date;
        if (now.getTime() < isVerified.expiry + (12 * 60 * 60 * 1000))
            renderVerifiedPage();
        else 
            logout();
    }
    let threadID = localStorage.getItem("threadID");
    console.log(threadID);
    getThreadItem(threadID);
    document.getElementById("thread-comment-form").onsubmit = (event) => {
        if (!isVerifiedStr){
            alert('Must Be Logged In To Comment');
            window.location.href = "http://52.162.249.144/login";
            return false;
        }
        processForm(event, threadID);
        window.location.reload();
        return false;
    };
}

function renderVerifiedPage() {
    let link = id('loginLink');
    link.innerHTML = "Logout";
    link.removeAttribute("href");
    link.setAttribute("onclick", "logout()");
    link.onclick = function() { logout() };
}

function logout() {
    localStorage.removeItem('isVerified');
    fetch("http://52.162.249.144/logout", {
        method: "get"
    }).then( async res => {
        if (res.status === 200) {
            alert('Successfully Logged Out');
            window.location = '/home';
        }
    }).catch( err => {
        console.log(err);
    });
}

function render(threadID) {
    let title = id('thread-title');
    let content = id('thread-content');
    title.innerHTML = local_item.title + " by " + local_item.username;
    content.innerHTML = local_item.content;
    
    const template = id('comment-item-template');
    let list_elt = id('comment-list');
    list_elt.innerHTML = '';
    for (let i = 0; i < local_comments.length; ++i) {
        let new_li = document.importNode(template.content, true);
        new_li.querySelector('.comment-creator').textContent = local_comments[i].username;
        //local_comments[i].comment.Replace("\n", "<br />");
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
        getComments(threadID);
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

function processForm (event, threadID) {
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