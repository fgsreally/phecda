
        export class TestRpc{
            
    run(){
      return {tag:'TestRpc',method:"run",isEvent:false,queue:"xx"}

    }
    
    event(){
      return {tag:'TestRpc',method:"event",isEvent:true,queue:"test"}

    }
    
            }