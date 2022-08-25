let userName, contactName = "Todos", loading = false, visibility = "Publico"

function loadPage() {
    
    const promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
    promise.then(messages => {
        
        const chat = document.querySelector('.chat');
        chat.innerHTML = "";
        messages = messages.data;
        
        for(let i = 0; i < messages.length; i++) {
            
            let message = "";
            
            switch(messages[i].type) {
                
                case 'private_message':
                    if(messages[i].to === userName ||  messages[i].from === userName)
                        message =   `<h1 class="container message private">
                                    <span class="time">(${messages[i].time})</span>
                                    <span class="target">${messages[i].from}</span>
                                    <span>reservadamente para</span>
                                    <span class="target">${messages[i].to}:</span>
                                    ${messages[i].text}</h1>
                                    `
                    break;
                
                case 'status':
                    message = `<h1 class="container message room-activity">
                            <span class="time">(${messages[i].time})</span>
                            <span class="target">${messages[i].from}</span>
                            ${messages[i].text}</h1>
                            `
                    break;
                
                case 'message':
                    message = `<h1 class="container message">
                            <span class="time">(${messages[i].time})</span>
                            <span class="target">${messages[i].from}</span>
                            <span>para</span>
                            <span class="target">${messages[i].to}:</span>
                            ${messages[i].text}</h1>
                            `
            
            }
            
            chat.innerHTML += message;

    }

    })

}

function stillOnline() {
    axios.post("https://mock-api.driven.com.br/api/v6/uol/status", {name: userName});
}

function revealPage() {

    const login_page = document.querySelector('section');
    login_page.classList.add('hidden');

    const main_page = document.querySelector('.page');
    main_page.classList.remove('hidden');


    window.scrollTo(0, document.body.scrollHeight);
    setInterval(stillOnline, 5000);
    setInterval(loadPage, 5000);

}


function sendMessage() {

    const message_form = document.querySelector('#message-type-box');
    const msg = {
        from: userName,     
        to: contactName,
        text: message_form.value,
        type: (visibility == "Publico" ? "message" : "private_message")
    }
    message_form.value = "";
    
    const aux = axios.post("https://mock-api.driven.com.br/api/v6/uol/messages", msg);
    aux.catch(function() {window.location.reload()});

}

function confirmar(resultado) {

    if(resultado.response.status == 400) 
        alert("Esse nick já está sendo utilizado!");
    else
        revealPage();
} 

function login() {
    
    userName = document.querySelector('#user-name').value;
    const obj = {name: userName};

    let promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", obj);
    promise.then(revealPage).catch(confirmar);

}

function selectParticipant(element) {

    if(loading) return;

    const previous = document.querySelectorAll('.selected');
    for(let i = 0; i < previous.length; i++) {
        previous[i].classList.add('hidden');
        previous[i].classList.remove('selected');
    }
    

    const checkmark = element.querySelector('.checkmark');
    checkmark.classList.remove('hidden');
    checkmark.classList.add('selected');

    contactName = element.querySelector('h3').innerHTML;
    console.log(contactName);

    const feedback = document.querySelector('.footer h3');
    feedback.innerHTML = `Enviando para ${contactName} (${visibility.toLowerCase()})`
}

function selectVisibility(element) {


    const previous = document.querySelector('.setted');
    previous.classList.add('hidden');
    previous.classList.remove('setted');
    

    const checkmark = element.querySelector('.checkmark');
    checkmark.classList.remove('hidden');
    checkmark.classList.add('setted');

    visibility = element.querySelector('h3').innerHTML;

    const feedback = document.querySelector('.footer h3');
    feedback.innerHTML = `Enviando para ${contactName} (${visibility.toLowerCase()})`

}

function getChatMembers() {
    
    const promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/participants');
    loading = true;

    promise.then(response => {
        contactsList = document.querySelector('#contacts')
        contactsList.innerHTML = `  
                            <div class="container contact" data-identifier="participant" onclick="selectParticipant(this)">
                                <ion-icon name="people"></ion-icon></ion-icon>
                                <h3>Todos</h3>
                                <ion-icon class="selected checkmark" name="checkmark"></ion-icon>
                            </div>
                         `; // Todos já começa como padrão
        
        console.log(contactName);
        if(contactName !== "Todos") {
            const aux = document.querySelector('.selected');
            aux.classList.remove('.selected');
            aux.classList.add('hidden');
        }

        let chatMembers = response.data;
        for(let i = 0; i < chatMembers.length; i++) {
            let contactHTML = (contactName === chatMembers[i].name ? 
                        `
                            <div class="container contact" data-identifier="participant" onclick="selectParticipant(this)">
                                <ion-icon name="md-contact"></ion-icon>
                                <h3>${chatMembers[i].name}</h3>
                                <ion-icon class="selected checkmark" name="checkmark"></ion-icon>
                            </div>
                        `
                        :
                        `
                            <div class="container contact" data-identifier="participant" onclick="selectParticipant(this)">
                                <ion-icon name="md-contact"></ion-icon>
                                <h3>${chatMembers[i].name}</h3>
                                <ion-icon class="hidden checkmark" name="checkmark"></ion-icon>
                            </div>
                        `)
            contactsList.innerHTML += contactHTML;
        }
        loading = false;
    })

}

function revealNavbar() {

    const navbar = document.querySelector('navbar');
    navbar.classList.remove('hidden');

    const hideDiv = document.querySelector('#hide-chat');
    hideDiv.classList.remove('hidden');

}

function hideNavbar() {

    const navbar = document.querySelector('navbar');
    navbar.classList.add('hidden');

    const hideDiv = document.querySelector('#hide-chat');
    hideDiv.classList.add('hidden');
}

function addEnterEvent() {
    const input = document.querySelectorAll("input");
    input[0].addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            login();
        }
    });
    input[1].addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            sendMessage();
        }
    });
}

addEnterEvent();
getChatMembers();
loadPage();
setInterval(getChatMembers, 10000);
