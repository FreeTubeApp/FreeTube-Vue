const axios = require("axios")
const baseURL = "https://www.youtube.com/"
const ajaxURL = "comment_ajax"

class HttpRequester {
    static session;
    static async requestVideoPage(videoId) {
        //'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
        this.session = axios.create({
            baseURL: baseURL,
            timeout: 1000,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'accept-language': 'en-US,en;q=0.5'
            }
        })
        const config = {
            headers: {
                'x-youtube-client-name': '1',
                'x-youtube-client-version': '2.20180222',
                'accept-language': 'en-US,en;q=0.5'
            }
        }
        // cookie1 = GPS=1; path=/; domain=.youtube.com; expires=Thu, 17-Sep-2020 13:03:47 GMT  cookie2 = VISITOR_INFO1_LIVE=a9IsI_YF_U8; path=/; domain=.youtube.com; secure; expires=Tue, 16-Mar-2021 12:33:47 GMT; httponly; samesite=None
        try {
            const response =  await axios.get(baseURL+ "watch?v=" + videoId)
            this.session.defaults.headers.Cookie = response.headers["set-cookie"][0]
            //this.session.defaults.headers.Cookie = (response.headers["set-cookie"][1])
            this.session.defaults.headers.Cookie = response.headers["set-cookie"][0]+';'+response.headers["set-cookie"][1]+';'+response.headers["set-cookie"][2]
            return response
            //return await axios.get(trending_page, config)
        } catch (e) {
            return {
                error: true,
                message: e
            }
        }
    }
    static async ajax_request(data, params){
        // this params variable is needed in order to post the data as raw body and not as object
        const urlSearchParams = new URLSearchParams();
        urlSearchParams.append('video_id', data.video_id)
        urlSearchParams.append('session_token', data.session_token)
        if (data.hasOwnProperty('page_token')) {
            urlSearchParams.append('page_token', data.page_token)
        }
        // this way is the only way the query parameters are actually postes
        //return this.session.post('http://requestbin.net/r/1dt35v81' + `?action_load_comments=1&order_by_time=true&filter=${params.filter}&order_menu=${params.order_menu}`, urlSearchParams)
        return this.session.post(ajaxURL + `?action_load_comments=1&order_by_time=True&filter=${params.filter}&order_menu=${params.order_menu}`, urlSearchParams)
    }
    static deleteSession(){
        this.session = null
    }
}
module.exports = HttpRequester
