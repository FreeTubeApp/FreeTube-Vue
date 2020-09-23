const scraper = require("./src/Youtube-Scraper")
let currVidId = null

process.on('message', (mess) => {
  if (mess.indexOf('snp') !== -1) {
    if (currVidId !== mess.substr(3)) {
      currVidId = mess.substr(3)
      scraper.cleanupStatics()
    }
    scraper.scrape_next_page_youtube_comments(currVidId).then((data) => {
      process.send(JSON.stringify(data))
    }).catch((err) => {
      console.error(err)
      process.send('error')
    })
  } else if (mess.indexOf('cus') !== -1) {
    scraper.cleanupStatics()
  }
})
