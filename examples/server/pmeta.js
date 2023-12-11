
        export class TestController{
            
    mq(arg0){
const ret={tag:"test-mq",body:{},headers:{},query:{},params:{},method:"post",url:"/base/mq"}
if(arg0!==undefined&&arg0!==null){ret.body=arg0
}

return ret
    }
    
    test(arg0,arg1,arg2){
const ret={tag:"test-test",body:{},headers:{},query:{},params:{},method:"post",url:"/base/{{test}}"}
if(arg0!==undefined&&arg0!==null){ret.params['test']=arg0
ret.url=ret.url.replace('{{test}}',arg0)}
if(arg1!==undefined&&arg1!==null){ret.body['name']=arg1
}
if(arg2!==undefined&&arg2!==null){ret.query=arg2
}

return ret
    }
    
    query(arg0,arg1){
const ret={tag:"test-query",body:{},headers:{},query:{},params:{},method:"get",url:"/base/query"}
if(arg0!==undefined&&arg0!==null){ret.query['id']=arg0
}
if(arg1!==undefined&&arg1!==null){ret.query['name']=arg1
}

return ret
    }
    
    sendMsgToMQ(arg0){
const ret={tag:"test-sendMsgToMQ",body:{},headers:{},query:{},params:{},method:"get",url:"/base/send"}
if(arg0!==undefined&&arg0!==null){ret.body['data']=arg0
}

return ret
    }
    
    get(){
const ret={tag:"test-get",body:{},headers:{},query:{},params:{},method:"get",url:"/base/get"}

return ret
    }
    
            }