
import { Watcher,Storage } from 'phecda-react'


@Storage('home')
export class HomeModel {
    name = 'home'
    changeName(name: string) {
        this.name = name
    }
    @Watcher('update')
    watcher(data: string) {
       alert(data)
    }

    get fullName(){
        return 'name:'+this.name
    }
}


