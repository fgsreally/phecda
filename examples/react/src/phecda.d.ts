import { HomeModel } from './models/home';
import 'phecda-react'

declare module 'phecda-react'{
    interface NameSpace {
        home: HomeModel;
      }
     
      interface Events{
        update:string
      }
}

