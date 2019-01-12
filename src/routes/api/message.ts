import * as express from 'express';
import * as line from '@line/bot-sdk';
import ApiBase from '../apiBase';
import * as config from 'config';
import HttpUtility from '../../utils/httpUtil';

/** API実装例 */
export default class Example extends ApiBase
{
    //#region エンドポイント処理

    /**
     * Webhook受け口
     * @param {express.Request} req - リクエスト
     * @param {express.Request} res - レスポンス
     * @param {express.Request} next - リダイレクト
    */
    protected postEvent(req : express.Request, res : express.Response, next : express.NextFunction)
    {
        // メッセージ処理
        if(req.body && req.body.events && req.body.events.length > 0)
        {
            // Webhookイベントオブジェクトを取得
            let events = req.body.events as line.WebhookEvent[];

            // アクションによって処理を切り替え
            let event = events[0];
            switch(event.type)
            {
                // メッセージ送信の場合
                case 'message' :

                    // メッセージを処理
                    this.receiveMessage(event, res);

                    break;

                // その他の場合
                case 'beacon' :
                case 'follow' :
                case 'join' :
                case 'leave' :
                case 'memberJoined' : 
                case 'memberLeft' :
                case 'postback' :
                case 'unfollow' :
                default :

                    res.statusCode = 200;
                    res.end();

                    break;
            }
        }
        else
        {
            res.statusCode = 400;
            res.json('events is required.');
        }
    }

    //#endregion

    //#region チェック処理

    /**
     * GETパラメータチェック
     * @param {express.Request} req - リクエスト
    */
    protected postCheck(req : express.Request) : string
    {
        if(!req.body)
        {
            return 'request body is required.';
        }

        if(!('events' in req.body))
        {
            return 'request body events is required.';
        }

        return null;
    }
    
    //#endregion

    //#region プライベートメソッド

    /**
     * LINEから送信されたメッセージを処理
     * @param {line.MessageEvent} message - 送信されたメッセージ 
     * @param {express.Response} res - レスポンス
    */
    private receiveMessage(message : line.MessageEvent, res : express.Response)
    {
        // メッセージ種類によって処理を切り替え
        let url : string;
        let body : {};
        if(message && message.message && message.message.type)
        {
            switch(message.message.type)
            {
                // テキストメッセージの場合
                case 'text':
                    url = config.get('worker.text');
                    body = message.message;
                    break;

                // 画像送信の場合
                case 'image':
                    url = '';
                    body = message.message;
                    break;

                // 動画送信の場合
                case 'video':
                    url = '';
                    body = message.message;
                    break;
                
                // その他の場合
                case 'sticker':
                case 'file':
                case 'location':
                case 'audio':
                default:
                    break;
            }
        }

        // メッセージ種類毎に異なるリクエストを送信
        if(url != '')
        {
            this.doRequest(url, body, res);
        }
        else
        {
            res.statusCode = 200;
            res.end();
        }
    }

    /**
     * リクエストを送信
     * @param {string} url - URL
     * @param {{}} body - リクエストボディ 
     * @param {express.Response} res - レスポンス
     */
    private doRequest(url : string, body : any, res : express.Response)
    {
        HttpUtility.post(
            url,
            {
                json : true,
                body : body,
                headers : {
                    'Content-Type':'application/json'
                }
            },
            (err, response, responseBody) => {
                // 結果をAPIの応答にセット
                res.statusCode = response.statusCode;
                res.json(responseBody); 
            }
        );
    }

    //#endregion
}