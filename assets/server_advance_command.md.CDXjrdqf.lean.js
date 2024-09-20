import{_ as s,c as a,a1 as t,o as l}from"./chunks/framework.wIY8TazG.js";const E=JSON.parse('{"title":"命令行工具","description":"","frontmatter":{},"headers":[],"relativePath":"server/advance/command.md","filePath":"server/advance/command.md","lastUpdated":1726817183000}'),h={name:"server/advance/command.md"};function n(e,i,k,p,d,o){return l(),a("div",null,i[0]||(i[0]=[t(`<h1 id="命令行工具" tabindex="-1">命令行工具 <a class="header-anchor" href="#命令行工具" aria-label="Permalink to &quot;命令行工具&quot;">​</a></h1><div class="info custom-block"><p class="custom-block-title">INFO</p><p>不要太在意，用一下就知道了</p></div><h2 id="phecda-init" tabindex="-1">phecda init <a class="header-anchor" href="#phecda-init" aria-label="Permalink to &quot;phecda init&quot;">​</a></h2><p>初始化<code>tsconfig.json</code>和<code>ps.json</code>，后者会被运行时读取， 一个例子：</p><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  &quot;$schema&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;node_modules/phecda-server/bin/schema.json&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  &quot;resolve&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      &quot;source&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;controller&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      &quot;importer&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;http&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      &quot;path&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;.ps/http.js&quot;</span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">//</span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;"> 如果本文件是</span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;"> *.http.ts</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ,</span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">引入了另一个*.</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">controller</span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">.</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">ts</span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">，那么这个引入会重定向至\`.</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">ps</span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">/</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">http</span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">.</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">ts</span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      &quot;source&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;rpc&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      &quot;importer&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;client&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      &quot;path&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;.ps/rpc.js&quot;</span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">//</span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;"> 如果本文件是</span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;"> *.client.ts</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ,</span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">引入了另一个*.</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">rpc</span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">.</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">ts</span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">，那么这个引入会重定向至\`.</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">ps</span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">/</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">rpc</span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">.</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">ts</span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">\`</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ],</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  &quot;unimport&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 需要单独安装unimport,这些配置会传到createUnimport中</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  &quot;virtualFile&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: { </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 虚拟文件</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &quot;virtual:a&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;console.log(1)&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  &quot;moduleFile&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;test&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;">//</span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;"> 默认只有命名规范中的文件会触发热更新，现在</span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;"> *.test.ts</span><span style="--shiki-light:#B31D28;--shiki-dark:#FDAEB7;--shiki-light-font-style:italic;--shiki-dark-font-style:italic;"> 也会</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="phecda-generate-file" tabindex="-1">phecda generate [file] <a class="header-anchor" href="#phecda-generate-file" aria-label="Permalink to &quot;phecda generate [file]&quot;">​</a></h2><p>启动程序，使生成器生成代码，然后退出 用于<code>ci/cd</code></p><h2 id="phecda-file" tabindex="-1">phecda [file] <a class="header-anchor" href="#phecda-file" aria-label="Permalink to &quot;phecda [file]&quot;">​</a></h2><p>启动程序，这是最常用的</p><h3 id="环境变量" tabindex="-1">环境变量 <a class="header-anchor" href="#环境变量" aria-label="Permalink to &quot;环境变量&quot;">​</a></h3><ol><li><code>PS_STRICT</code> 如果设置，那么使用了未设置的守卫、拦截器等，会直接报错</li><li><code>PS_LOG_LEVEL</code> <code>info/log/warning/error</code> 对应0到3，只有高于<code>PS_LOG_LEVEL</code>的信息才会被输出</li><li><code>NODE_ENV</code>为非<code>development</code>时，禁止热更新</li></ol><h3 id="交互命令" tabindex="-1">交互命令 <a class="header-anchor" href="#交互命令" aria-label="Permalink to &quot;交互命令&quot;">​</a></h3><p>输入<code>e</code>并回车会退出程序，输入<code>r</code>回车会完全重启</p><h3 id="nodejs-参数" tabindex="-1">nodejs 参数 <a class="header-anchor" href="#nodejs-参数" aria-label="Permalink to &quot;nodejs 参数&quot;">​</a></h3><p>传递给<code>nodejs</code>的参数需:</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npx</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> phecda</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> file.ts</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --inspect</span></span></code></pre></div>`,16)]))}const c=s(h,[["render",n]]);export{E as __pageData,c as default};
