import fs from 'fs'
import path from 'path'

fs.readdir(path.join(__dirname, 'data'), (err, files) => {
  readFiles(files)
    .then(mergeData)
    .then(msg => {
      console.log(msg)
    })
    .catch(err => {
      console.error(err)
    })

})

function readFiles(files) {
  let promises = []
  files.forEach(f => {
    promises.push(readFile(f))
  })
  return Promise.all(promises)
}

function readFile(f) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, 'data', f), 'utf8', (err, body) => {
      if (err) reject(err)

      else resolve(uniqHistories(JSON.parse(body)))
    })
  })
}

function uniqHistories(histories) {
  return histories.map(h => {
    return uniqHistory(h)
  })
}

function uniqHistory(history) {
  var uniqHistories = []
  var uniqHistoryIds = []

  history.history.forEach(h => {
    // 업소명과 시작날짜를 uniq id 로 지정
    var id = h.storeNm.replace(/ /g, '') + '-' + h.stdt
    if (uniqHistoryIds.indexOf(id) === -1) {
      uniqHistoryIds.push(id)
      uniqHistories.push(h)
    }
  })

  history.history = uniqHistories
  return history
}

function mergeData(data) {
  let result = []
  data.forEach(d => {
    result = result.concat(d)
  })

  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(__dirname, 'data.json'), JSON.stringify(result), 'utf8', err => {
      if (err) reject(err)
      else resolve('success')
    })
  })

}
