
        export class TestController{
            
    mq(...args){
const ret={tag:"test",func:"mq",body:{},headers:{},query:{},params:{},method:"post",url:"/base/mq1",args}

ret.body=args[0]


return ret
    }
    
    test(...args){
const ret={tag:"test",func:"test",body:{},headers:{},query:{},params:{},method:"post",url:"/base/{{test}}",args}

ret.params['test']=args[0]
ret.url=ret.url.replace('{{test}}',args[0])
ret.body['name']=args[1]

ret.query=args[2]


return ret
    }
    
    query(...args){
const ret={tag:"test",func:"query",body:{},headers:{},query:{},params:{},method:"get",url:"/base/query",args}

ret.query['id']=args[0]

ret.query['name']=args[1]


return ret
    }
    
    sendMsgToMQ(...args){
const ret={tag:"test",func:"sendMsgToMQ",body:{},headers:{},query:{},params:{},method:"get",url:"/base/send",args}

ret.body['data']=args[0]


return ret
    }
    
    get(...args){
const ret={tag:"test",func:"get",body:{},headers:{},query:{},params:{},method:"get",url:"/base/get",args}


return ret
    }
    
    params(...args){
const ret={tag:"test",func:"params",body:{},headers:{},query:{},params:{},method:"get",url:"/base/params",args}

ret.query=args[0]


return ret
    }
    
            }