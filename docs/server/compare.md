# compare

对比只基于同类功能的对比，不会拿`PS`的类型复用去跟`nest`去比较，因为其没有相应的功能

## express
`PS`本质上，只是为一个`Router`提供了一系列中间件

严格来说，倒和`express`没啥区别

## nestjs
既然长得和`nest`近似，为什么不直接使用`nest`?

一个最直接的结论是：`nest`有点过于复杂了，

所谓复杂，一是指学习成本，

我们总希望企业级框架能解决企业级问题，但实际上成本变成了理解企业级框架+解决问题两部分

二是指编写+管理成本，关于代码本身的成本，

举个最简单的例子，在几乎所有项目，`app.module.ts`中，能看到非常臃肿的引入，还有各式各样的`forRoot`等调用，但实际上这一大段纯粹是一个清单，它几乎没有做任何事，但又不能不写
明明已经通过`import/export`实现模块化、建立关系，开发者仍需要去列一个清单，而一旦在清单中遗漏，从报错中很难意识到（nest v8）

:::tip question
`nest`为什么这么做，一是出于历史原因，二是（我个人认为）太过于强调依赖注入了，什么地方什么东西什么形式，全想注入，当然麻烦

除此之外，由于`ts`对装饰器支持度一般，这导致很多时候类型的重复声明
:::

这种通过一个清单，去控制模块导入导出的功能，比较常见于安全相关的情形，比如`serverless`

这又说到第三点，运作成本

我不知道这是不是个秘密，由于过多的包和过于复杂的结构，`nest`实际上性能不太妙，无论是并发还是热启动，随便一个框架都能超过它几倍（是的，是倍数），没有哪个云会希望用上`nestjs`的

`nest`中真正吸引人的，一是依赖注入+控制反转，但实际上真正重要的是构造函数的注入（相信我，属性注入等其他形式的注入要么不用，要么后期容易忘掉）

二是易于理解、组织的声明式+`aop`写法，但这由于过于自由的注入，没有贯彻到底，比如大量的`@Inject`/`forRoot`，让写法变得很繁复

三是生态，这和前端不一样，`nest`生态=`express`+`mongodb/redis...`+`nest`本身生态

一个基于`express`的框架可以复用第一类生态，第二类生态基本都是稍稍封装，第三类则数量较少。

生态上的负担没有前端那种离了`react`就没法过了那么夸张

`phecda-server`在尽力保留`nest`优势的同时，简化其复杂度

> 一个比较鲜明的不同点是，`phecda-server`中`filter/pipe`都是唯一的，不能添加多个，我认为多个只会让情况变得难以理解

## trpc/tsrpc/httpc
这三种都是基于`远程函数调用`的思路，前两能够复用类型

但它们都是基于特定的约定的，从而屏蔽body/method/query/params,如果要对原有项目进行迁移，等同于完全重写前端的api调用，也没办法使用express生态

`trpc`是用于同仓库中的类型复用,`tsrpc`则是可以跨越项目

`phecda-server`和前者相同,也可以合并批次请求，不同之处是，由于采用`nest`模式，多了管道+中间件

`tsrpc`非常厉害，应该是唯一一个可以跨项目复用类型的东西，但其逻辑是先声明接口类型和返回类型，再回过头去实现，`phecda-server`则是只顾着实现函数，这在小型项目中会更方便一点


## 独有的功能
由于采用`nest`结构，管理上可以模块化，从而给热更新提供可能，

`PS`应该是唯一一个`nodejs`里可以提供模块级热更新的框架，不用再重启进程，重新建立数据库连接，一个文件更改就只会更改一个模块，这和前端热更新一样

再加上`swc`处理`ts`,开发启动、更新的性能真的是极限中的极限了