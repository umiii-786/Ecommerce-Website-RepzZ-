
const conversationListEl = document.getElementById('conversation-list');
const chatHeaderEl = document.getElementById('chat-header');
const messageAreaEl = document.getElementById('message-area');
const messageFormEl = document.getElementById('message-form');
const messageInputEl = document.getElementById('message-input');
const statusMessageEl = document.getElementById('status-message');

// Dummy data for conversations and messages
const conversations = [
    {
        id: 'cust-1',
        name: 'Jane Doe',
        lastMessage: 'I need to return an item.',
        messages: [
            { sender: 'customer', text: 'Hi, I received my order but it\'s the wrong size.', time: '10:00 AM' },
            { sender: 'agent', text: 'Hello! I am sorry to hear that. Could you please provide your order number?', time: '10:05 AM' },
            { sender: 'customer', text: 'It\'s #4567-GRZ. I need to return it and get a refund.', time: '10:07 AM' }
        ]
    },
    {
        id: 'cust-2',
        name: 'John Smith',
        lastMessage: 'Where is my order?',
        messages: [
            { sender: 'customer', text: 'Hi, I ordered a pair of shoes last week and the tracking hasn\'t updated.', time: 'Yesterday' },
            { sender: 'agent', text: 'Hello John, let me check the status for you. What is your order ID?', time: 'Yesterday' }
        ]
    },
    {
        id: 'cust-3',
        name: 'Alice Johnson',
        lastMessage: 'Just wanted to say thank you!',
        messages: [
            { sender: 'customer', text: 'Just received my order. The quality is amazing! Thank you!', time: '2 days ago' },
            { sender: 'agent', text: 'That\'s great to hear, Alice! We appreciate your feedback.', time: '2 days ago' }
        ]
    }
];

let activeConversation = null;

// Function to render the list of conversations
function renderConversations() {
    conversationListEl.innerHTML = '';
    conversations.forEach(convo => {
        const li = document.createElement('li');
        li.classList.add('conversation-item');
        li.setAttribute('data-id', convo.id);
        li.innerHTML = `
                    <div class="conversation-name">${convo.name}</div>
                    <div class="last-message">${convo.lastMessage}</div>
                `;
        li.addEventListener('click', () => {
            selectConversation(convo);
        });
        conversationListEl.appendChild(li);
    });
}

// Function to select and display a conversation
function selectConversation(convo) {
    // Remove active class from previous item
    if (activeConversation) {
        const prevActive = document.querySelector(`.conversation-item[data-id="${activeConversation.id}"]`);
        if (prevActive) prevActive.classList.remove('active');
    }

    // Add active class to new item
    const newActive = document.querySelector(`.conversation-item[data-id="${convo.id}"]`);
    if (newActive) newActive.classList.add('active');

    activeConversation = convo;
    chatHeaderEl.textContent = `Chat with ${convo.name}`;
    renderMessages(convo.messages);
    messageFormEl.style.display = 'flex';
}

// Function to render messages in the chat area
function renderMessages(messages) {
    messageAreaEl.innerHTML = '';
    messages.forEach(msg => {
        const msgEl = document.createElement('div');
        msgEl.classList.add('message', msg.sender === 'agent' ? 'sent' : 'received');
        msgEl.innerHTML = `
                    <div>${msg.text}</div>
                    <div class="message-time">${msg.time}</div>
                `;
        messageAreaEl.appendChild(msgEl);
    });
    // Scroll to the bottom of the message area
    messageAreaEl.scrollTop = messageAreaEl.scrollHeight;
}

// Function to handle sending a new message
function handleSendMessage(event) {
    event.preventDefault();
    const text = messageInputEl.value.trim();
    if (text && activeConversation) {
        const newMessage = {
            sender: 'agent',
            text: text,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
        activeConversation.messages.push(newMessage);
        renderMessages(activeConversation.messages);
        messageInputEl.value = '';
    }
}

// Initial setup
window.onload = () => {
    renderConversations();
    messageFormEl.addEventListener('submit', handleSendMessage);
};
