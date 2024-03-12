const request = require('axios');

let _proxy = null

async function getNewProxy() {
    const url = `http://webapi.http.zhimacangku.com/getip?num=1&type=2&pro=&city=0&yys=0&port=1&time=1&ts=1&ys=1&cs=1&lb=1&sb=0&pb=4&mr=1&regions=`
    const res = await request.get(url)
    const proxyList = res.data.data
    updateProxy(proxyList[0])
}

function updateProxy(proxy) {
    _proxy = proxy
    setTimeout(() => {
        _proxy = null
    }, new Date(proxy.expire_time).getTime() - new Date().getTime());
}

async function getProxy() {
    if (process.env.NODE_ENV !== 'production') {
        return null
    }
    if (!_proxy) {
        await getNewProxy()
    }
    return _proxy
}

module.exports = {
    getProxy
}

