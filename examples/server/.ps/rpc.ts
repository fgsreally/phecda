
        export class TestRpc{
            
    run(){
      return {tag:'TestRpc',func:"run",isEvent:false,queue:""}

    }
    
    event(){
      return {tag:'TestRpc',func:"event",isEvent:true,queue:"test"}

    }
    
            }