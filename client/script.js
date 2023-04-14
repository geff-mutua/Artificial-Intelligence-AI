import bot from './assets/bot.svg';
import user from '/assets/user.svg';

const form=document.querySelector('form');
const chatContainer=document.querySelector('#chat_container');

let loadInterval

function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
      // Update the text content of the loading indicator
      element.textContent += '.';

      // If the loading indicator has reached three dots, reset it
      if (element.textContent === '....') {
          element.textContent = '';
      }
  }, 300);
}

function typeText(element,text){
  let index=0;

  let interval=setInterval(()=>{
    if(index <text.length){
      element.innerHTML +=text.charAt(index);
      index++;
    }else{
      clearInterval(interval);
    }
  },20);
}

function generateUniqueId(){
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalstring = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalstring}`
}

function chatStripe(isAi, value, uniqueId){

  return ( 
    `
    <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
            <div class="profile">
                <img src= "${isAi ? bot : user}" 
                alt="${isAi ? 'bot' : 'user'}"/>
            </div>
            <div class="message" id="${uniqueId}">${value}</div>
        </div>
    </div>
    `
  );
}

const handleSubmit = async(e) =>{
  e.preventDefault();

  const data = new FormData(form);

  // Display Prompt Question
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  form.reset();

  // Bot Response Stripe
  const uniqueId=generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

   // to focus scroll to the bottom 
   chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv=document.getElementById(uniqueId);

  loader(messageDiv);

  // Fetch response from the server
  const response = await fetch('https://gideon.onrender.com/',{
    method: 'POST',
    headers:{
      'Content-Type': 'Application/json'
    },
    body:JSON.stringify({
      prompt: data.get('prompt')
    })
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML='';

  if(response.ok){
    const data = await response.json();
    const parseData = data.bot.trim();

    typeText(messageDiv,parseData);
  }else{
    const err= await response.text;
    
    messageDiv.innerHTML = "Am sorry, Something Went Wrong. Am not in my correct state of mind at the moment";
 
  }
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e)=>{
  if(e.keyCode === 13){
    handleSubmit(e);
  }
})