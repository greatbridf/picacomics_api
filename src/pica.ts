'use strict';

import { send_request, send_get, send_request_raw } from './request.js'
import { Category, ComicList, ComicDetail, Eps, Ep } from './type.js'

const sign_in_url = 'auth/sign-in'
const categories_url = 'categories'
const list_base_url = 'comics?'   // + params
const detail_base_url = 'comics/' // + comic id
// eps_base_url comics/${comic_id}/eps?page=${eps_page}
// ep_base_url  comics/${comic_id}/order/${ep_order}/pages?page=${ep_page}
const keywords_url = 'keywords'

/**
 * @type ua: 默认
 * @type dd: 新到旧
 * @type da: 旧到新
 * @type ld: 最多爱心
 * @type vd: 最多指名
 */
type sorts = 'ua' | 'dd' | 'da' | 'ld' | 'vd'

async function authorize(username: string, password: string): Promise<string> {
    let json = await send_request(sign_in_url, 'POST', { 'email': username, 'password': password }, globalThis.proxy, null)
    return json.data.token
}

async function categories(token: string): Promise<Category[]> {
    let json = await send_get(categories_url, globalThis.proxy, token)
    return json.data.categories
}

async function list(token: string, params: URLSearchParams): Promise<ComicList> {
    let json = await send_get(list_base_url + params.toString(), globalThis.proxy, token)
    return json.data.comics
}

async function list_by_block(token: string, block_name: string, page: number, sort: sorts): Promise<ComicList> {
    let params = new URLSearchParams({
        page: page.toString(),
        c: block_name,
        s: sort
    })
    return list(token, params)
}

async function list_by_tag(token: string, tag_name: string, page: number, sort: sorts): Promise<ComicList> {
    let params = new URLSearchParams({
        page: page.toString(),
        t: tag_name,
        s: sort
    })
    return list(token, params)
}

async function detail(token: string, comic_id: string): Promise<ComicDetail> {
    let json = await send_get(detail_base_url + comic_id, globalThis.proxy, token)
    return json.data.comic
}

async function eps(token: string, comic_id: string, eps_page: number): Promise<Eps> {
    let url = `comics/${comic_id}/eps?page=${eps_page}`
    let json = await send_get(url, globalThis.proxy, token)
    return json.data.eps
}

async function ep(token: string, comic_id: string, ep_order: number, ep_page: number): Promise<Ep> {
    let url = `comics/${comic_id}/order/${ep_order.toString()}/pages?page=${ep_page}`
    let json = await send_get(url, globalThis.proxy, token)
    return json.data.pages
}

async function image_response(token: string, file_server: string, h_url: string) {
    return await send_request_raw(file_server + '/', 'static/' + h_url, 'GET', null, globalThis.proxy, token)
}

async function image(token: string, file_server: string, h_url: string): Promise<Buffer> {
    return (await image_response(token, file_server, h_url)).buffer()
}

async function image_stream(token: string, file_server: string, h_url: string): Promise<NodeJS.ReadableStream> {
    return (await image_response(token, file_server, h_url)).body;
}

// temporarily unavailable: returns empty array
async function recommendations(token: string, comic_id: string) {
    let url = `comics/${comic_id}/recommendation`
    let json = await send_get(url, globalThis.proxy, token)
    return json.data.comics
}

async function keywords(token: string): Promise<string[]> {
    let json = await send_get(keywords_url, globalThis.proxy, token)
    return json.data.keywords
}

async function favourite(token: string, page: number): Promise<ComicList> {
    let url = `users/favourite?s=dd&page=${page}`
    let json = await send_get(url, globalThis.proxy, token)
    return json.data.comics
}

export {
    authorize,
    categories,
    list_by_block,
    list_by_tag,
    detail,
    eps,
    ep,
    image,
    image_stream,
    recommendations,
    keywords,
    favourite,
}
