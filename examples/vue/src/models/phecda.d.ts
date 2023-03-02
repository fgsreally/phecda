import { HomeModel } from './home';
import 'phecda-core'

declare module 'phecda-core'{
    interface PhecdaNameSpace {
        home: HomeModel;
      }
     
      interface PhecdaEvents{
        update:{
          type:string,
          value:string,
          from:string
        }
      }
}

