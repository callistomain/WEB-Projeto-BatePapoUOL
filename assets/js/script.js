// INIT ==========================================================================
const urlParticipants = "https://mock-api.driven.com.br/api/v6/uol/participants";
const urlMessages = "https://mock-api.driven.com.br/api/v6/uol/messages";
const urlStatus = "https://mock-api.driven.com.br/api/v6/uol/status";
const chatroom = document.querySelector(".chatroom");
let userName = "";

// LOGIN ===========================================================================
const loginForm = document.forms[0];
const loginInput = loginForm.elements["name"];
const loginButton = loginForm.querySelector("button");
const loginSubmit = loginForm.querySelector(".submit");
const loginLoading = loginForm.querySelector(".loading");

loginForm.addEventListener("submit", validateLogin);
loginInput.addEventListener("input", updateButton);
updateParticipants();
updateMessages(true);

function validateLogin(e) {
    e.preventDefault();
    loginSubmit.classList.add("hide");
    loginLoading.classList.remove("hide");
    
    const obj = { name: loginInput.value };
    const data = createPostData(obj);
    
    fetch(urlParticipants, data)
    .then(response => {
        if (response.ok) {
            userName = loginInput.value;
            // Animation
            loginForm.classList.add("fade");
            setTimeout(() => loginForm.classList.add("hide"), 1000);
            // Intervals
            setInterval(() => updateStatus(obj), 5000);
            setInterval(updateMessages, 3000);
            setInterval(updateParticipants, 5000);
            // Immediate update
            updateParticipants();
            updateMessages(true);
            // Show chatroom
            chatroom.classList.remove("hide");
        } else {
            loginSubmit.classList.remove("hide");
            loginLoading.classList.add("hide");
            alert("Nome já em uso, tente outro.")
        }
    }).catch(error => {
        loginSubmit.classList.remove("hide");
        loginLoading.classList.add("hide");
        alert("Erro de conexão de internet!")
    });
}

// Status
function updateStatus(obj) {
    const data = createPostData(obj);
    fetch(urlStatus, data)
    .then(response => {
        if (!response.ok) {
            window.location.reload();
            alert("Problema de conexão, você foi desconectado.");
        }
    })
    .catch(error => {
        window.location.reload();
        alert("Problema de conexão, você foi desconectado.");
    });
}

// Login Button
function updateButton(e) {
    if (loginForm.checkValidity()) loginButton.classList.add("valid");
    else loginButton.classList.remove("valid");
}

// CHAT ==========================================================================
const chat = document.querySelector(".chat");
let chatPercent;

function updateMessages(scrollToLast) {
    fetch(urlMessages)
    .then(response => response.json())
    .then(data => {
        const fragment = document.createDocumentFragment();
        data.sort(sortMessages);
        data.forEach(e => {
            if (e.type === "private_message" && e.from !== userName && e.to !== userName && e.to !== "Todos") return;
            fragment.appendChild(createMessage(e));
        });
        chat.replaceChildren(fragment);

        // Scroll to last
        if (scrollToLast || chatPercent > 90) chat.children[chat.children.length - 1].scrollIntoView();
    });
}

// Chatbox
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
        updateMessages(true);
    }).then(response => {
        if (!response.ok) {
            window.location.reload();
            alert("Problema de conexão, você foi desconectado.");
        }
    })
    .catch(error => {
        window.location.reload();
        alert("Problema de conexão, você foi desconectado.");
    });
}

// SIDEBAR ==============================================================================================
const sidebar = document.forms[2];
const userList = sidebar.querySelector(".user-list");
const chatboxInfo = document.querySelector("small");
let userSelected = "Todos";
let visibility = "public";

function updateParticipants() {
    fetch(urlParticipants)
    .then(response => response.json())
    .then(data => { // Manual check and "all" user fallback
        const fragment = document.createDocumentFragment();
        let selectedFound = false;
        
        data.unshift({ name: "Todos" });
        data.forEach(e => {
            const user = createParticipant(e);
            fragment.appendChild(user);

            if (e.name === userSelected) {
                selectedFound = true;
                user.children[0].checked = true;
            };
        });
        userList.replaceChildren(fragment);
        
        if (!selectedFound) {
            userSelected = "Todos";
            chatboxInfo.children[0].textContent = userSelected;
            userList.children[0].children[0].checked = true;
        };
        
    });
}

// Onclick
function updateSelected() {
    userSelected = this.htmlFor;
    chatboxInfo.children[0].textContent = userSelected;
}

function updateVisibility(tag) {
    visibility = tag.htmlFor;
    chatboxInfo.children[1].textContent = `(${tag.children[1].textContent.toLowerCase()})`;
}

// Animation
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
    input.id = obj.name;
    input.name = "participant";
    input.setAttribute("data-identifier", "participant");

    const label = document.createElement("label");
    label.htmlFor = obj.name;

    const icon = document.createElement("ion-icon");
    icon.setAttribute("name", "person-circle");
    if (obj.name === "Todos") icon.setAttribute("name", "people");

    const span = document.createElement("span");
    span.textContent = obj.name;

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

function sortMessages(a, b) {
    if (a.time === b.time) return a.from.localeCompare(b.from);
}

function scrolling() {
    let height = chat.clientHeight;
    let scrollHeight = chat.scrollHeight - height;
    let scrollTop = chat.scrollTop;
    chatPercent = Math.floor(scrollTop / scrollHeight * 100);
}
