const generateMessage = (username, text)=>{
  return {
    username,
    text,
    'createdAt': new Date().getTime()
  }
}

const generateLocationMessage = (username, geoLocation) => {
  return {
    username,
    'url': `https://google.com/maps?q=${geoLocation.latitude},${geoLocation.longitude}`,
    'createdAt': new Date().getTime()
  }
}

module.exports = {
  generateMessage,
  generateLocationMessage
}