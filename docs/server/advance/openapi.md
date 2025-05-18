# openapi/swagger
最初并不支持`openapi`，这出于两方面的考虑
1. 已经可以复用类型，`openapi`意义较小
2. 如果要支持，那么就需要和`nestjs`一样，以类的形式去做参数类型，
比如
```ts
class DataVO{
    //...
}

class MyController{
    @Post()
    post(@Body data:DataVO){

    }
}
```
如果坚持这种模式，需要提供一整套装饰器，包括`openapi`/`数据验证`等

我对这种模式持怀疑态度，无论体验还是自由度都有点糟糕

但鉴于`openapi`在某些场景确实有用，故提供一个简单的版本

```ts
/**
 * Swagger 装饰器函数
 * @param config Swagger 配置
 */
export function ApiDoc(config: SwaggerConfig) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    //...
    };
}

class MyController{
    @Post()
    @ApiDoc({
        //显然这里需要写一大坨东西，请利用ai生成，并在平时将其折叠
    })
    post(@Body data:any){

    }
}

```