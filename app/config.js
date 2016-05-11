export default {
  db: {
    host: 'localhost',
    port: 3306,
    database: 'sg',
    username: 'root',
    password: ''
  },
  request: {
    JSESSIONID: 'wy3wXy1PcnQmVyxrxyMMxbGbtmmMctv2MrDJsKymGJwKQp7fYjSJ!-1174637260',
    header: {
      'Name': 'Value',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/601.5.17 (KHTML, like Gecko) Version/9.1 Safari/601.5.17',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'content-type': 'application/json'
    }
  },
  addr: {
    url: 'http://www.juso.go.kr/addrlink/addrLinkApi.do',
    confmKey: 'U01TX0FVVEgyMDE2MDUwOTE0Mzk0Mg==',
    countPerPage: 1
  },
  getStoreHistoryUrl(bldCd) {
    return `http://sg.sbiz.or.kr/fos/store/getStoreHistoryInfo.json?bldCd=${bldCd}`
  }
}
