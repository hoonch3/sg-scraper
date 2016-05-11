import fs from 'fs'
import path from 'path'

fs.readdir(path.join(__dirname, 'data'), (err, files) => {
  console.log(files)
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
      else resolve(body)
    })
  })
}

function mergeData(data) {
  let result = []
  data.forEach(d => {
    result = result.concat(JSON.parse(d))
  })

  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(__dirname, 'data.json'), JSON.stringify(result), 'utf8', err => {
      if (err) reject(err)
      else resolve('success')
    })
  })

}
