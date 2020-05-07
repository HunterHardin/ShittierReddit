"use strict";
const id = _id => document.getElementById(_id);
document.querySelector("body").onload = main;

function main () {
    const isVerifiedStr = localStorage.getItem("isVerified");
    if (isVerifiedStr) {
        const isVerified = JSON.parse(isVerifiedStr);
        const now = new Date;
        if (now.getTime() < isVerified.expiry + (12 * 60 * 60 * 1000))
            renderVerifiedPage();
        else 
            logout();
    }
    document.getElementById("register-form").onsubmit = (event) => {
        event.preventDefault();
        processForm(event);
        //window.location.href = "http://52.162.249.144/login";
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
            window.location = '/threadsHome';
        }
    }).catch( err => {
        console.log(err);
    });
}
function processForm (event) {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords aren't the same.");
        return;
    }
    const data = {username, password};
    fetch("http://52.162.249.144/register", {
        method: "post",
        body: JSON.stringify(data),
        headers: {"Content-Type": "application/json"}
    }).then( async res => {
        if (res.status === 200) {
            alert('Account Created');
        } else if (res.status === 409) {
            alert('Username exists');
        } else {
            window.location = '/threadsHome';
        }
    }).catch( err => {
        console.log(err);
    });
}