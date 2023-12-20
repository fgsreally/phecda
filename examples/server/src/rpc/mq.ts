
        export class TestRpc{
            
    run(){
      return {tag:'TestRpc-run',isEvent:false,rpc:["redis","mq",]}

    }
    
    event(){
      return {tag:'TestRpc-event',isEvent:true,rpc:["redis","mq",]}

    }
    
            }