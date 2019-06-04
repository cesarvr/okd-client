const delay = (rs, rj) => {
  setTimeout(() => {
    console.log('delaying ')
    rs(true)
  }, 1000)
}

module.exports = {
  delay1000: () => new Promise(delay)
}
