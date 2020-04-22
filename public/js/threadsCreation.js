"use strict";
document.querySelector("body").onload = main;

function main () {
    document.getElementById("thread-creation-form").onsubmit = (event) => {
        event.preventDefault();

        processForm(event);

        return false;
    };
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