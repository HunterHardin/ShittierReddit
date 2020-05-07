"use strict";
const id = _id => document.getElementById(_id);
document.querySelector("body").onload = main;

function main () {
    document.getElementById("login-form").onsubmit = (event) => {
        event.preventDefault();
        processForm(event);
        return false;
    };
}

async function processForm (event) {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const data = {username, password};
    console.log(data);
    const res = await fetch('http://52.162.249.144/login', {
        method: 'post',
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json'}
    });

    if (res.status === 200) {
        const now = new Date;
        const item = {
            value: true,
            expiry: now.getTime()
        }
        localStorage.setItem('isVerified', JSON.stringify(item));
        localStorage.setItem('username', username);
        alert('Login successful');
        window.location.href = "http://52.162.249.144/threadsHome";
    } else if (res.status === 401) {
        alert('Incorrect username/password');
    } else {
        window.location = '/threadsHome';
    }
}