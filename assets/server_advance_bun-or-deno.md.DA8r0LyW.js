import{_ as e,c as o,o as d,a2 as n}from"./chunks/framework.OWRZTr7j.js";const h=JSON.parse('{"title":"bun or deno","description":"","frontmatter":{},"headers":[],"relativePath":"server/advance/bun-or-deno.md","filePath":"server/advance/bun-or-deno.md","lastUpdated":1720516461000}'),c={name:"server/advance/bun-or-deno.md"},a=n('<h1 id="bun-or-deno" tabindex="-1">bun or deno <a class="header-anchor" href="#bun-or-deno" aria-label="Permalink to &quot;bun or deno&quot;">​</a></h1><p>由于<code>ps</code> 运行时使用了 <code>nodejs</code>特有的功能</p><p>在<code>bun/deno</code>中不能使用</p><p>一种简单的解决方法是：</p><blockquote><p>前提是服务端框架自身要支持<code>nodejs</code>+<code>bun/deno</code></p></blockquote><ol><li>开发时仍使用<code>nodejs</code>，鉴于快速的热更新，这只会比直接使用<code>deno/bun</code>要快</li><li>生产时通过<code>tsc</code>编译（不能使用<code>unimport/virtualFile</code>等运行时提供的功能）或者<a href="./bundle.html">打包</a>,对产物再使用<code>deno/bun</code>要快</li></ol>',6),t=[a];function r(s,_,l,u,i,p){return d(),o("div",null,t)}const m=e(c,[["render",r]]);export{h as __pageData,m as default};