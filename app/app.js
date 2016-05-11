import fs from 'fs'
import path from 'path'
import request from 'request'
import _ from 'lodash'
import urlencode from 'urlencode'
import { parseString } from 'xml2js'
import config from './config'

const j = request.jar()
// set fake cookie(get this cookie on browser developer-tool after login)
const cookie = request.cookie(`JSESSIONID=${config.request.JSESSIONID}`)

fs.readFile(path.join(__dirname, 'blds', 'blds.json'), 'utf8', (err, result) => {
  let count = 0
  let num = 10
  const data = JSON.parse(result)
  const blds = _.uniq(getBldCds(data.list))
  const bldsLength = blds.length

  const theTimer = setInterval(() => {
    main()
  }, 3000)

  function main() {
    if (count > Math.floor(bldsLength/num)) {
      clearInterval(theTimer)
    } else {
      var promises = []
      var targetBlds = blds.slice(0 + (count * num), 0 + ((count + 1) * num))

      targetBlds.forEach(function(t) {
        promises.push(getStoreHistoryInfo(t))
      })

      Promise.all(promises)
      .then(getTargetDatas)
      .then(convertNewAddrs)
      .then(result => {
        count++
        return writeData(result, count)
      })
      .then(msg => {
        console.log(count + '번째 빌딩 데이터 수집 성공')
      })
      .catch(err => {
        console.log('Error!')
        console.log(err)
      })

    }
  }
})

function getBldCds(blds) {
  return blds.map(bld => {
    return bld.bldCd
  })
}

function getStoreHistoryInfo(buildingId) {
  return new Promise((resolve, reject) => {
    var targetUrl = config.getStoreHistoryUrl(buildingId)
    j.setCookie(cookie, targetUrl)

    request({
      method: 'GET',
      url: targetUrl,
      jar: j,
      headers: config.request.header
    }, (err, res, body) => {
      if (err) {
        reject(err)
      }
      else {
        let data = JSON.parse(body)

        if (data['exception']) {
          resolve()
        } else {
          resolve({buildingId: buildingId, history: data, addrHouseNumber: 0, addrStreet: ''})
        }
      }
    })
  })
}

function getTargetData(history) {
  if (history) {
    history.history = history.history.list['StoreHistory.getStoreHistoryInfo1']
    return history
  } else {
    return false
  }
}

function getTargetDatas(histories) {
  return histories.map(h => {
    return getTargetData(h)
  })
}

function convertNewAddr(history) {
  return new Promise((resolve, reject) => {
    let promises = []
    history.history.forEach(h => {
      promises.push(getNewAddr(h.housAddr))
    })

    Promise.all(promises)
      .then(values => {
        values.forEach((v, i) => {
          parseString(v, (err, convertedV) => {
            var newAddr = convertedV.results.juso[0].roadAddr
            history.history[i].housAddr = typeof newAddr === 'string' ? newAddr : newAddr[0]
          })
        })

        var splitedNewAddr = history.history[0].housAddr.split(' ')
        history.addrHouseNumber = splitedNewAddr.slice(-2, -1)[0]
        history.addrStreet = splitedNewAddr.slice(-3, -2)[0]
        resolve(history)
      })
      .catch(err => {
        reject(err)
      })
  })
}

function convertNewAddrs(histories) {
  let promises = []
  histories.forEach(h => {
    if (h) {
      promises.push(convertNewAddr(h))
    }
  })
  return Promise.all(promises)
}

function getNewAddr(oldAddr) {
  return new Promise((resolve, reject) => {
    request({
      url: `${config.addr.url}?confmKey=${config.addr.confmKey}&countPerPage=${config.addr.countPerPage}&keyword=` + urlencode(oldAddr)
    }, (err, res, body) => {
      if (err) reject(err)
      else resolve(body)
    })
  })
}

function writeData(histories, count) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(__dirname, 'data', `data${count}.json`), JSON.stringify(histories), 'utf8', err => {
      if (err) reject(err)
      else resolve('success!')
    })
  })
}
