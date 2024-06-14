import{_ as e,c as a,o,a2 as t}from"./chunks/framework.BL8mXeqL.js";const m=JSON.parse('{"title":"打包","description":"","frontmatter":{},"headers":[],"relativePath":"server/advance/bundle.md","filePath":"server/advance/bundle.md","lastUpdated":1718360476000}'),d={name:"server/advance/bundle.md"},c=t('<h1 id="打包" tabindex="-1">打包 <a class="header-anchor" href="#打包" aria-label="Permalink to &quot;打包&quot;">​</a></h1><p>如果需要打包，可以使用<code>unplugin-phecda-server</code>（我目前只测试过<code>vite</code>）</p><p>我不太推崇这个行为，</p><p>一是收益并不明显</p><p>二是打包过程中会导致类名发生更改（丑化）</p><p>这在<code>phecda</code>架构中很危险！</p><p>假设控制器类名原本为<code>TestController</code>，打包可能变成<code>TestController2</code>,这会导致开发生产有较大区别</p><p>两种解决方法：</p><ol><li>对所有控制器使用<code>Tag</code>，强制命名</li><li>导出所有控制器，从而防止类名更改（不一定可行）</li></ol>',9),r=[c];function n(s,l,p,_,i,h){return o(),a("div",null,r)}const v=e(d,[["render",n]]);export{m as __pageData,v as default};
