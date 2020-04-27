"use strict";
console.log('Test1');
document.querySelector("body").onload = main;

function main () {
    console.log('Test2');
    document.getElementById("login-form").onsubmit = (event) => {
        event.preventDefault();
        processForm(event);
        return false;
    };
}

function processForm (event) {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const data = {username, password};
    console.log(data);
    fetch("http://52.162.249.144/login", {
        method: "post",
        body: JSON.stringify(data),
        headers: {"Content-Type": "application/json"}
    }).then( res => {
        console.log(`${res.statusText} ${res.status}`)
    }).catch( err => {
        console.log(err);
    });
}

/*
async function processForm () {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const res = await fetch('http://52.162.249.144/login', {
        method: 'post',
        body: JSON.stringify({username, password}),
        headers: {'Content-Type': 'application/json'}
    });
    if (res.status === 200) {
        alert('Login successful');
    } else if (res.status === 401) {
        alert('Incorrect username/password');
     } else {
         window.location = '/error';
     }
}
*/