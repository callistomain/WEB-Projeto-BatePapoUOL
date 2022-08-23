// INIT ==========================================================================
const chatroom = document.querySelector(".chatroom");

// LOGIN ===========================================================================
const loginForm = document.forms[0];
const loginInput = loginForm.elements["name"];
const loginButton = loginForm.querySelector("button");
const loginSubmit = loginForm.querySelector(".submit");
const loginLoading = loginForm.querySelector(".loading");
const urlLogin = "https://mock-api.driven.com.br/api/v6/uol/participants";

loginForm.addEventListener("submit", validateLogin);
loginInput.addEventListener("input", updateButton);

function validateLogin(e) {
    e.preventDefault();
    loginSubmit.classList.add("hide");
    loginLoading.classList.remove("hide");

    const obj = {
        name: loginInput.value,
    };
    const data = createPostData(obj);

    fetch(urlLogin, data).then(response => {
        if (response.ok) {
            loginForm.classList.add("fade");
            setTimeout(() => loginForm.classList.add("hide"), 1000);
            // REFACTOR
            chatroom.classList.remove("hide");
            chat.children[chat.children.length - 1].scrollIntoView();
        } else {
            loginSubmit.classList.remove("hide");
            loginLoading.classList.add("hide");
        }
    });
}

function updateButton(e) {
    if (loginForm.checkValidity()) loginButton.classList.add("valid");
    else loginButton.classList.remove("valid");
}

// CHAT ==========================================================================
const chat = document.querySelector(".chat");
const urlMessages = "https://mock-api.driven.com.br/api/v6/uol/messages";
setInterval(parseMessages, 3000);
parseMessages();

function parseMessages() {
    fetch(urlMessages)
    .then((response) => response.json())
    .then((data) => {
        const fragment = document.createDocumentFragment();
        data.forEach((e) => fragment.appendChild(createMessage(e)));
        chat.replaceChildren(fragment);
        chat.children[chat.children.length - 1].scrollIntoView();
    });
}

// DOM
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
        case "status": span.textContent = " entra na sala..."; break;
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
        text.textContent = `: ${obj.message}`;

        message.appendChild(contact);
        message.appendChild(text);
    }

    return message;
}

// HELPERS ==================================================================
function createPostData(obj) {
    return {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(obj),
    };
}
