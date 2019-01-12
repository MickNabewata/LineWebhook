import { describe, it } from 'mocha';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as line from '@line/bot-sdk';
import message from '../../../src/routes/api/message';
import * as express from "express";
import HttpUtility from '../../../src/utils/httpUtil';
import * as request from 'request';
import * as config from 'config';

/** HttpUtility.doRequestメソッドのスタブ */
let doRequest : sinon.SinonStub<[string, request.CoreOptions, request.RequestCallback], void>;

beforeEach(() => {
    doRequest = sinon.stub(HttpUtility, 'post');
});

afterEach(() => {
    doRequest.restore();
});

describe('message - post', () => {
    it('正常系', () => {
        // テスト値
        let eventMessage : line.EventMessage = { id : 'dammyMessage1', type : 'text', text : 'aaa' };
        let eventSource : line.EventSource = { 'type' : 'user', 'userId' : 'dammyUser1' };
        let event : line.WebhookEvent = { type : 'message', message : eventMessage, timestamp : 0, source : eventSource , replyToken : 'dammyReplyToken1'};
        let events : line.WebhookEvent[] = [ event ];
        let content  = { events : events };
        let expectedStatusCode = 200;
        let expectedUri : string = config.get('worker.text');
        let expectedCalledOptions : request.CoreOptions = {
            json : true,
            formData : eventMessage,
            headers : {
                'Content-Type':'application/json'
            }
        };

        // スタブ
        let req : Partial<express.Request> = { body : content };
        let res : Partial<express.Response> = { header: sinon.stub(), json: sinon.stub(), end: sinon.stub() };
        let next : Partial<express.NextFunction> = {};
        let calledUri : string;
        let calledOptions : request.CoreOptions;
        doRequest.callsFake((uri, options, callback) => {
            calledUri = uri;
            calledOptions = options;

            res.statusCode = 200;
            res.json();
        });

        // 実行
        new message().post(<express.Request>req, <express.Response>res, <express.NextFunction>next);
        
        // 確認
        chai.expect(expectedStatusCode).to.deep.equal(res.statusCode);
        chai.expect(expectedUri).to.deep.equal(calledUri);
        chai.expect(expectedCalledOptions).to.deep.equal(calledOptions);
        chai.expect(true).to.deep.equal(doRequest.calledOnce);
    });
});