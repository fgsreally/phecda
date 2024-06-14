import{_ as a,c as s,o as e,a2 as i}from"./chunks/framework.BL8mXeqL.js";const _=JSON.parse('{"title":"合并请求","description":"","frontmatter":{},"headers":[],"relativePath":"server/advance/parallel-route.md","filePath":"server/advance/parallel-route.md","lastUpdated":1718360476000}'),t={name:"server/advance/parallel-route.md"},n=i(`<h1 id="合并请求" tabindex="-1">合并请求 <a class="header-anchor" href="#合并请求" aria-label="Permalink to &quot;合并请求&quot;">​</a></h1><blockquote><p>把接口调用抽象成函数调用，那么函数当然可以同时调用多个，但这样会发出多次请求，这完全可以合并成一次请求</p><p>只针对于<code>server</code>框架，<code>rpc</code>没有</p></blockquote><p><code>phecda-server</code>会开放一条路由，用于合并请求,和<code>trpc</code>类似</p><p>这个功能存在<a href="./limit.html#只支持-json-格式的上传返回">局限</a></p><p>主要目的也并非出于性能，而是在很多服务端框架不提供注销路由的方法前提下，保证热更新功能的相对完整</p><h2 id="服务方" tabindex="-1">服务方 <a class="header-anchor" href="#服务方" aria-label="Permalink to &quot;服务方&quot;">​</a></h2><p>默认的并行路由是<code>/__PHECDA_SERVER__</code>，可以手动设置</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bind</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(app, data, {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  parallelRoute</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><p>如果设置<code>false</code>，就禁用</p><h2 id="调用方" tabindex="-1">调用方 <a class="header-anchor" href="#调用方" aria-label="Permalink to &quot;调用方&quot;">​</a></h2><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> chain</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createChainReq</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  instance,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  { test: UserController },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  { batch: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span></code></pre></div>`,11),l=[n];function p(h,r,d,o,c,k){return e(),s("div",null,l)}const u=a(t,[["render",p]]);export{_ as __pageData,u as default};
