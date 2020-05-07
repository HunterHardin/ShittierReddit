"use strict";
const id = _id => document.getElementById(_id);
document.querySelector("body").onload = main;

function main () {
    const isVerifiedStr = localStorage.getItem("isVerified");
    let isVerified;
    if (isVerifiedStr) {
        isVerified = JSON.parse(isVerifiedStr);
        const now = new Date;
        if (now.getTime() < isVerified.expiry + (12 * 60 * 60 * 1000))
            renderVerifiedPage();
        else 
            logout();
    }
    document.getElementById("thread-creation-form").onsubmit = (event, isVerified) => {
        event.preventDefault();
        if (!isVerifiedStr){
            alert('Must Be Logged In To Create Threads');
            window.location.href = "http://52.162.249.144/login";
            return false;
        }
        processForm(event);
        window.location.href = "http://52.162.249.144/threadsHome";
        return false;
    };
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

async function processForm (event) {
    const title = document.getElementById("thread-title").value;
    const content = document.getElementById("thread-content").value;
    console.log(`New Thread: ${title} ${content}`);
    const data = {
        title: title, 
        content: content
    };
    
    fetch("http://52.162.249.144/createThread", {
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