
import { Watcher,Storage, Init } from 'phecda-react'


// @Storage('home')
export class HomeModel {
    name = 'home'
    changeName(name: string) {
        this.name = name
    }

    @Init
    _init(){
     return new Promise((resolve)=>{
        setTimeout(()=>{
            this.name='newOne'
            resolve()
        },3000)
     })
    }
    @Watcher('update')
    watcher(data: string) {
       alert(data)
    }

    get fullName(){
        return 'name:'+this.name
    }
}


