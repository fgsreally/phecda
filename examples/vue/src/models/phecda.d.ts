import { HomeModel } from './home';
import 'phecda-vue'

declare module 'phecda-vue'{
    interface PhecdaNameSpace {
        home: HomeModel;
      }
     
      interface PhecdaEvents{
        update:{
          type:string,
          value:string,
          from:string
        }
        add:null
      }
}

