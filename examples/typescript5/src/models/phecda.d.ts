import { HomeModel } from './home';
import 'phecda-vue'

declare module 'phecda-vue'{
    interface NameSpace {
        home: HomeModel;
      }
     
      interface Events{
        update:{
          type:string,
          value:string,
          from:string
        }
        add:null
      }
}

