import { HomeModel } from './user';
import 'phecda-vue'

declare module 'phecda-vue'{
    interface NameSpace {
        home: HomeModel;
      }
     
      interface Events{
        update:string
        add:null
      }
}

