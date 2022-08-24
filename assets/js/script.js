// INIT ==========================================================================
const chatroom = document.querySelector(".chatroom");
let userName = "";

// LOGIN ===========================================================================
const loginForm = document.forms[0];
const loginInput = loginForm.elements["name"];
const loginButton = loginForm.querySelector("button");
const loginSubmit = loginForm.querySelector(".submit");
const loginLoading = loginForm.querySelector(".loading");
const urlParticipants = "https://mock-api.driven.com.br/api/v6/uol/participants";
const urlStatus = "https://mock-api.driven.com.br/api/v6/uol/status";
const urlMessages = "https://mock-api.driven.com.br/api/v6/uol/messages";

loginForm.addEventListener("submit", validateLogin);
loginInput.addEventListener("input", updateButton);
updateParticipants();
updateMessages();

function validateLogin(e) {
    e.preventDefault();
    loginSubmit.classList.add("hide");
    loginLoading.classList.remove("hide");
    
    const obj = {
        name: loginInput.value,
    };
    const data = createPostData(obj);
    
    fetch(urlParticipants, data).then(response => {
        if (response.ok) {
            userName = loginInput.value;
            loginForm.classList.add("fade");
            setTimeout(() => loginForm.classList.add("hide"), 1000);
            setInterval(() => refreshStatus(obj), 5000);
            // REFACTOR
            setInterval(updateMessages, 3000);
            setInterval(updateParticipants, 5000);
            chatroom.classList.remove("hide");
            chat.children[chat.children.length - 1].scrollIntoView();
        } else {
            // <SMALL> NOME INVALIDO
            loginSubmit.classList.remove("hide");
            loginLoading.classList.add("hide");
        }
    }).catch(error => {
        loginSubmit.classList.remove("hide");
        loginLoading.classList.add("hide");
    });
}

function refreshStatus(obj) {
    // console.log("WAT");
    const data = createPostData(obj);
    fetch(urlStatus, data)
    .then(response => {
        // if (response.ok) console.log("DEU BOM");
        // else console.log("DEU RUIM");
    });
}

function updateButton(e) {
    if (loginForm.checkValidity()) loginButton.classList.add("valid");
    else loginButton.classList.remove("valid");
}

// CHAT ==========================================================================
const chat = document.querySelector(".chat");

function updateMessages() {
    fetch(urlMessages)
    .then((response) => response.json())
    .then((data) => {
        const fragment = document.createDocumentFragment();
        data.forEach(e => {
            if (e.type === "private_message" && e.from !== userName && e.to !== userName && e.to !== "Todos") return;
            fragment.appendChild(createMessage(e));
        });
        chat.replaceChildren(fragment);
        // REFACTOR
        if (percent > 90 && time <= 0) chat.children[chat.children.length - 1].scrollIntoView();
    }).catch(error => console.log(error)); // put a five turn count to refresh page
}

const chatbox = document.forms[1];
const messagebox = chatbox.elements["messagebox"];
chatbox.addEventListener("submit", submitMessage);

function submitMessage(e) {
    e.preventDefault();

    const obj = {
        from: userName,
        to: userSelected,
        text: messagebox.value,
        type: visibility === "public" ? "message" : "private_message"
    };

    messagebox.value = "";
    const data = createPostData(obj);

    fetch(urlMessages, data).then(response => {
        if (response.ok) {
            updateMessages();
            // chat.children[chat.children.length - 1].scrollIntoView();
        } else window.location.reload();
    }).catch(error => window.location.reload());
}

// SIDEBAR ==============================================================================================
const sidebar = document.forms[2];
const userList = sidebar.querySelector(".user-list");
let userSelected = "Todos";
let visibility = "public";

// REFACTOR !!!!!!!!
function updateParticipants() {
    fetch(urlParticipants)
    .then((response) => response.json())
    .then((data) => {
        const fragment = document.createDocumentFragment();
        let found = false;
        data.unshift({ name: "Todos" });
        data.forEach(e => {
            const user = createParticipant(e);
            fragment.appendChild(user);
            if (e.name === userSelected) { found = true; user.children[0].checked = true; };
        });
        userList.replaceChildren(fragment);
        if (!found) { userSelected = "Todos"; userList.children[0].children[0].checked = true; };
    }).catch(error => console.log(error));
}

function updateSelected() {
    userSelected = this.htmlFor;
}

function updateVisibility(tag) {
    visibility = tag.htmlFor;
}

const aside = document.querySelector("aside");
const bg = document.querySelector(".bg");

function showSidebar() {
    aside.classList.remove("hide");
    setTimeout(() => {
        bg.classList.remove("fade");
        sidebar.classList.remove("slide");
    }, 1);
}

function hideSidebar() {
    bg.classList.add("fade");
    sidebar.classList.add("slide");
    setTimeout(() => aside.classList.add("hide"), 500);
}

// DOM ==================================================================================================
function createMessage(obj) {
    const message = document.createElement("div");
    message.classList.add(obj.type.replace("_", "-"));

    const time = document.createElement("span");
    time.classList.add("time");
    time.textContent = `(${obj.time}) `;

    const user = document.createElement("span");
    user.classList.add("user");
    user.textContent = obj.from;

    const span = document.createElement("span");
    switch (obj.type) {
        case "status": span.textContent = " " + obj.text; break;
        case "message": span.textContent = " para "; break;
        case "private_message": span.textContent = " reservadamente para "; break;
    }

    message.appendChild(time);
    message.appendChild(user);
    message.appendChild(span);

    if (obj.type !== "status") {
        const contact = document.createElement("span");
        contact.classList.add("contact");
        contact.textContent = obj.to;

        const text = document.createElement("span");
        text.classList.add("text");
        text.textContent = `: ${obj.text}`;

        message.appendChild(contact);
        message.appendChild(text);
    }

    return message;
}

function createParticipant(obj) {
    const li = document.createElement("li");

    const input = document.createElement("input");
    input.type = "radio";
    input.id = obj.name; // id
    input.name = "participant";
    input.setAttribute("data-identifier", "participant");

    const label = document.createElement("label");
    label.htmlFor = obj.name; // id

    const icon = document.createElement("ion-icon");
    icon.setAttribute("name", "person-circle");
    if (obj.name === "Todos") icon.setAttribute("name", "people");

    const span = document.createElement("span");
    span.textContent = obj.name; // id

    label.appendChild(icon);
    label.appendChild(span);
    label.addEventListener("click", updateSelected);
    li.appendChild(input);
    li.appendChild(label);

    return li;
}

// HELPERS ==================================================================
function createPostData(obj) {
    return {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(obj),
    };
}

// STATISTICS
let percent = 0;
let time = 0;
let interval;

function scrolling() {
    let height = chat.clientHeight;
    let scrollHeight = chat.scrollHeight - height;
    let scrollTop = chat.scrollTop;
    percent = Math.floor(scrollTop / scrollHeight * 100);

    // REFACTOR
    time = 1000;
    clearInterval(interval);
    interval = setInterval(() => {
        time -= 100;
        if (time <= 0) clearInterval(interval);
    }, 100);
}