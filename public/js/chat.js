const socket = io()
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $location = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
const {username, room} = Qs.parse(location.search, {'ignoreQueryPrefix': true})

const autoScroll = () =>{
  //New message element
  const $newMessage = $messages.lastElementChild

  //Height of the new message
  const newMessageStyle = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyle.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  //Visible height
  const visibleHeight = $messages.offsetHeight

  // //Height of messages container
  const containerHeight = $messages.scrollHeight

  // //How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight

  if(containerHeight - newMessageHeight <= scrollOffset){
    $messages.scrollTop = $messages.scrollHeight
  }
}

socket.on('message', (message)=>{
  const html = Mustache.render(messageTemplate,{
    'username': message.username,
    'message': message.text,
    'createdAt': moment(message.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoScroll()
})

socket.on('geoLocation', (location)=>{
  const html = Mustache.render(locationMessageTemplate, {
    'username': location.username,
    'url': location.url,
    'createdAt': moment(location.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoScroll()
})

socket.on('roomData', ({room, users}) => {
  const html = Mustache.render(sidebarTemplate, {
    room, 
    users
  })
  document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (event)=>{
  event.preventDefault()
  $messageFormButton.setAttribute('disabled', 'disabled')
  const message = event.target.elements.message.value

  socket.emit('sendMessage', message, (error)=>{
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = ""
    $messageFormInput.focus()
    if(error){
      return console.log(error)
    }
    console.log('Message delivered!')
  })

} )

$location.addEventListener('click', ()=>{
  if(!navigator.geolocation){
    return alert('Geolocation is not supported by your browser')
  }
  
  $location.setAttribute('disabled', 'disabled')
  navigator.geolocation.getCurrentPosition((position)=>{
    socket.emit('sendLocation', {
      'latitude': position.coords.latitude,
      'longitude': position.coords.longitude
    }, ()=>{
      $location.removeAttribute('disabled')
      console.log("message delivered")
    })
  })
})

socket.emit('join', { username, room }, (error)=>{
  if(error){
    alert(error)
    location.href = '/'
  }
})