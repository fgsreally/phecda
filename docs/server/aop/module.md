# 模块化

如果需要一个模块，又提供守卫，又提供拦截器...提供多个`aop`的功能

那么可以

```ts
import { PModule } from "phecda-server";
@Tag("test")
class test extends PModule {
  constructor() {
    super("test"); //可以通过super，可以通过Tag,也可以直接通过类名，三者其一就行
  }

  pipe() {}

  guard() {}

  plugin() {}

  intercept(){}

  filter(){}
}
// in main.ts

Factory([test]);
```
