import * as request from 'request';

/** HTTPリクエストユーティリティ */
export default class HttpUtil
{
    /**
     * POSTリクエストを送信
     * @param {string} uri - URI
     * @param {request.CoreOptions} options - オプション
     * @param {request.RequestCallback} callback - コールバック
     */
    public static post(uri : string, options : request.CoreOptions, callback : request.RequestCallback)
    {
        request.post(uri, options, callback);
    }
}