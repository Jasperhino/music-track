let window1 = document.getElementById("window-1");

let window2and3 = document.getElementById("window-2and3");
let headerlink = document.getElementById("header-link");

headerlink.addEventListener("click", function () {
    window1.classList.toggle("active");
    window2and3.classList.toggle("active");

    if (headerlink.innerHTML == "about") {
        headerlink.innerHTML = "close";
    } else {
        headerlink.innerHTML = "about";
    }
});


let window2 = document.getElementById("window-2");
let window3 = document.getElementById("window-3");


let buttonright = document.getElementById("button-toggle-window-right");
let buttonleft= document.getElementById("button-toggle-window-left");

buttonright.addEventListener("click", function () {
    window2.classList.toggle("active");
    window3.classList.toggle("active");

    buttonright.classList.toggle("active");
    buttonleft.classList.toggle("active");


    if (buttonright.innerHTML == "&rarr;") {
        buttonright.innerHTML = "&larr;";
    } else {
        buttonright.innerHTML = "&rarr;";
    }
});

buttonleft.addEventListener("click", function () {
    window2.classList.toggle("active");
    window3.classList.toggle("active");
    buttonright.classList.toggle("active");
    buttonleft.classList.toggle("active");
});


