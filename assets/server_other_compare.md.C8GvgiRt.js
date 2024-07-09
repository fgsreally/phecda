import{_ as e,c as o,o as c,a2 as p}from"./chunks/framework.OWRZTr7j.js";const f=JSON.parse('{"title":"compare","description":"","frontmatter":{},"headers":[],"relativePath":"server/other/compare.md","filePath":"server/other/compare.md","lastUpdated":1720516461000}'),t={name:"server/other/compare.md"},d=p('<h1 id="compare" tabindex="-1">compare <a class="header-anchor" href="#compare" aria-label="Permalink to &quot;compare&quot;">​</a></h1><p>对比只基于同类功能的对比，不会拿<code>PS</code>的类型复用去跟<code>nest</code>去比较，因为其没有相应的功能</p><h2 id="express-fastify-koa-h3" tabindex="-1">express/fastify/koa/h3 <a class="header-anchor" href="#express-fastify-koa-h3" aria-label="Permalink to &quot;express/fastify/koa/h3&quot;">​</a></h2><p><code>PS</code>本质上，只是这几个东西的一个插件/中间件</p><h2 id="nestjs" tabindex="-1">nestjs <a class="header-anchor" href="#nestjs" aria-label="Permalink to &quot;nestjs&quot;">​</a></h2><p>既然长得和<code>nest</code>近似，为什么不直接使用<code>nest</code>?</p><p>一个最直接的结论是：<code>nest</code>有点过于复杂了，</p><p>所谓复杂，一是指学习成本，</p><p>我们总希望企业级框架能解决企业级问题，但实际上成本变成了理解企业级框架+解决问题两部分</p><p>二是指编写+管理成本，关于代码本身的成本，</p><p>举个最简单的例子，在几乎所有项目，<code>app.module.ts</code>中，能看到非常臃肿的引入，还有各式各样的<code>forRoot</code>等调用，但实际上这一大段纯粹是一个清单，</p><p>它几乎没有做任何事，但又不能不写</p><p>明明已经通过<code>import/export</code>实现模块化、建立关系，开发者仍需要去列一个清单，而一旦在清单中遗漏，从报错中很难意识到</p><div class="tip custom-block"><p class="custom-block-title">question</p><p><code>nest</code>为什么这么做，一是出于历史原因，二是（我个人认为）太过于强调依赖注入了，</p><p>什么地方什么东西什么形式，全想注入，当然麻烦</p><p>除此之外，由于<code>ts</code>对装饰器支持度一般，这导致很多时候类型的重复声明</p></div><p>这种通过一个清单，去控制模块导入导出的功能，比较常见于安全相关的情形，比如<code>serverless</code></p><p>这又说到第三点，运作成本</p><p>我不知道这是不是个秘密，由于过多的包和过于复杂的结构，<code>nest</code>实际上性能不太妙，就冷启动而言，随便一个东西都能超过它，没有哪个云会希望用上<code>nestjs</code>的</p><p><code>nest</code>中真正吸引人的，一是依赖注入+控制反转，但实际上真正重要的是构造函数的注入（相信我，属性注入等其他形式的注入真的不好用）</p><p>二是易于理解、组织的声明式+<code>aop</code>写法，但这由于过于自由的注入，没有贯彻到底，比如大量的<code>@Inject</code>/<code>forRoot</code>，让写法变得很繁复</p><p>三是生态，这和前端不一样，<code>nest</code>生态=<code>express</code>+<code>mongodb/redis...</code>+<code>nest</code>本身生态</p><p>一个基于<code>express</code>的框架可以复用第一类生态，第二类生态基本都是稍稍封装，第三类则数量较少。</p><p>生态上的负担没有前端那种离了<code>react</code>就没法过了那么夸张</p><h3 id="区别" tabindex="-1">区别 <a class="header-anchor" href="#区别" aria-label="Permalink to &quot;区别&quot;">​</a></h3><p><code>phecda-server</code>在尽力保留<code>nest</code>优势的同时，简化其复杂度</p><h2 id="trpc-tsrpc-httpc" tabindex="-1">trpc/tsrpc/httpc <a class="header-anchor" href="#trpc-tsrpc-httpc" aria-label="Permalink to &quot;trpc/tsrpc/httpc&quot;">​</a></h2><p>这三种都是基于<code>远程函数调用</code>的思路，前两能够复用类型</p><p>但它们都是基于特定的约定的，从而屏蔽body/method/query/params,如果要对原有项目进行迁移，等同于完全重写前端的api调用，也没办法使用express生态</p><p><code>trpc</code>是用于同仓库中的类型复用,<code>tsrpc</code>则是可以跨越项目</p><p><code>phecda-server</code>和前者相同,也可以合并批次请求，不同之处是，由于采用<code>nest</code>模式，多了管道+中间件等<code>aop</code>的模式</p><p><code>tsrpc</code>非常厉害，应该是唯一一个可以跨项目复用类型的东西，但其逻辑是先声明接口类型和返回类型，再回过头去实现，</p><p><code>phecda-server</code>则用上了ts的隐式推导，只顾着实现函数，这在项目中会更效率一点</p>',31),a=[d];function s(r,n,h,i,l,m){return c(),o("div",null,a)}const u=e(t,[["render",s]]);export{f as __pageData,u as default};