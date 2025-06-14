
        export class TestController{
            
    login(...args){
const ret={tag:"TestController",func:"login",body:{},headers:{},query:{},params:{},method:"post",url:"/base/login"}

ret.body=args[0]


return ret
    }
    
    emitTest(...args){
const ret={tag:"TestController",func:"emitTest",body:{},headers:{},query:{},params:{},method:"get",url:"/base/test"}

ret.query['data']=args[0]


return ret
    }
    
    framework(...args){
const ret={tag:"TestController",func:"framework",body:{},headers:{},query:{},params:{},method:"get",url:"/base/framework"}


return ret
    }
    
    validate(...args){
const ret={tag:"TestController",func:"validate",body:{},headers:{},query:{},params:{},method:"get",url:"/base/validate"}

ret.query['id']=args[0]


return ret
    }
    
            }