import { defineConfig } from 'vitepress'
const ogDescription = '贯穿前后端的依赖注入方案'

const base = process.env.NODE_ENV === 'production' ? '/phecda/' : ''

export default defineConfig({
  title: 'phecda',
  description: ogDescription,
  base,
  head: [
    ['link', { rel: 'icon', href: '' }],

  ],

  lastUpdated: true,
  themeConfig: {
    logo: '/phecda.png',
    editLink: {
      pattern: 'https://github.com/fgsreally/phecda/tree/master/docs/:path',
      text: '编辑本页',
    },
    lastUpdatedText: '最近更新时间',
    socialLinks: [{ icon: 'github', link: 'https://github.com/fgsreally/phecda' }],

    footer: {
      message: 'Released the MIT License.',
    },

    nav: [
      { text: '/', link: '/core/', activeMatch: '/core/' },

      { text: 'server', link: '/server/', activeMatch: '/server/' },
      // { text: '框架封装', link: '/pack/', activeMatch: '/pack/' },

    ],

    sidebar: {

      // '/': [
      //   {
      //     text: '核心',
      //     collapsed: true,
      //     items: [
      //       {
      //         text: '介绍',
      //         link: '/core/intro',
      //       },
      //       {
      //         text: '核心',
      //         link: '/core/core',
      //       },
      //       {
      //         text: '节点',
      //         link: '/core/node',
      //       },
      //       {
      //         text: '预设',
      //         link: '/core/preset',
      //       },
      //       {
      //         text: '功能模块',
      //         link: '/core/function',
      //       },
      //       {
      //         text: '渲染引擎',
      //         link: '/core/engine',
      //       },
      //       {
      //         text: 'phecda-vue',
      //         link: '/core/phecda-vue',
      //       },
      //       {
      //         text: '部署',
      //         link: '/core/deploy',
      //       },
      //     ],
      //   },
      //   {
      //     text: '案例',
      //     collapsed: false,
      //     items: [
      //       {
      //         text: '看见须知',
      //         link: '/example/must-know',
      //       },
      //       {
      //         text: '快速上手',
      //         link: '/example/quick-start',
      //       },
      //       {
      //         text: '预设',
      //         link: '/example/preset',
      //       },
      //       {
      //         text: '功能模块',
      //         link: '/example/function',
      //       },

      //     ],
      //   },

      // ],
      '/server/': [
        {
          text: 'phecda-server',
          collapsible: true,
          items: [
            {
              text: 'intro',
              link: '/server/intro',
            },

            {
              text: '快速开始',
              link: '/server/quick-start',
            },

            {
              text: '基础使用',
              link: '/server/base',
            },
          ],
        },
        {
          text: 'aop装饰器',
          collapsible: false,
          items: [
            {
              text: '守卫',
              link: '/server/aop/guard',
            },
            {
              text: '拦截器',
              link: '/server/aop/interceptor',
            },
            {
              text: '管道',
              link: '/server/aop/pipe',
            },
            {
              text: '插件',
              link: '/server/aop/plugin',
            },
            {
              text: '过滤器',
              link: '/server/aop/filter',
            },
            {
              text: 'extension',
              link: '/server/aop/extension',
            },
          ],
        },
        {
          text: 'advance',
          collapsible: false,
          items: [
            {
              text: '专用路由',
              link: '/server/route',
            },
            {
              text: '客户端',
              link: '/server/client',
            },
            {
              text: '规范',
              link: '/server/rule',
            },
            {
              text: 'phecda-core',
              link: '/server/phecda-core',
            },
            {
              text: '模块',
              link: '/server/module',
            },

            {
              text: '热更新',
              link: '/server/hmr',
            },
            {
              text: '自动引入',
              link: '/server/auto-import',
            },
            {
              text: '微服务',
              link: '/server/rpc',
            },

          ],
        },
        {
          text: '其他',
          collapsible: true,
          items: [
            {
              text: '和其他框架比较',
              link: '/server/other/compare',
            },
            {
              text: '类型的思考',
              link: '/server/other/types',
            },
            {
              text: '性能',
              link: '/server/other/benchmark',
            },
            {
              text: '一些问题',
              link: '/server/other/problem',
            },
            {
              text: 'changelog',
              link: '/server/other/changelog',
            },

          ],
        },
      ],
      // '/blog': [
      //   {
      //     text: '设计思路',
      //     collapsed: true,
      //     items: [
      //       {
      //         text: '开始之前',
      //         link: '/blog/index',
      //       },
      //       {
      //         text: '从哪儿开始',
      //         link: '/blog/question',
      //       },
      //       {
      //         text: '特性',
      //         link: '/blog/feature',
      //       },

      //       {
      //         text: '自定义',
      //         link: '/blog/custom',
      //       },
      //       {
      //         text: '自定义平台',
      //         link: '/blog/platform',
      //       },
      //       {
      //         text: '进展',
      //         link: '/blog/changelog',
      //       },
      //     ],
      //   },
      // ],

    },
  },
})

// <script type="module" src="https://unpkg.com/@splinetool/viewer@1.0.17/build/spline-viewer.js"></script>
// <spline-viewer url="https://prod.spline.design/5LO-7-aInDCm0cWL/scene.splinecode"></spline-viewer>
