import header from './header.js'
import fetch from 'node-fetch'
import proxy_agent from 'https-proxy-agent'

const base_url = 'https://picaapi.picacomic.com/'

type Method = 'POST' | 'GET'

// returns parsed json
async function send_request(h_url: string, method: Method,
    body: object | null, proxy: string | null, auth: string | null) {

    let resp = await send_request_raw(base_url, h_url, method, body, proxy, auth)
    return await resp.json()
}

async function send_request_raw(_base_url: string, h_url: string, method: Method,
    body: object | null, proxy: string | null, auth: string | null) {

    let h = new header(h_url, method)
    if (auth) {
        h.set_auth(auth)
    }
    let resp = await fetch(_base_url + h_url, {
        headers: h.headers,
        method: method,
        body: method === 'POST' ? JSON.stringify(body) : null,
        agent: proxy ? proxy_agent(proxy) : null
    })
    if (resp.status !== 200)
        throw Error('bad response code')
    return resp;
}

async function send_get(h_url, proxy, auth) {
    if (!auth || !h_url || !proxy) throw Error('null arguments')
    return await send_request(h_url, 'GET', null, proxy, auth)
}

export { send_request, send_get, send_request_raw }
