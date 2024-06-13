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
      { text: 'core', link: '/core/intro', activeMatch: '/core/' },

      { text: 'server', link: '/server/intro', activeMatch: '/server/' },
      { text: 'vue', link: '/vue/base', activeMatch: '/vue/' },

      // { text: '框架封装', link: '/pack/', activeMatch: '/pack/' },

    ],

    sidebar: {
      '/core/': [
        {
          text: '简介',
          link: '/core/intro',
        },
        {
          text: '标准',
          link: '/core/standard',
        },
        {
          text: '验证与转换',
          link: '/core/transform',
        },

        {
          text: '核心api',
          link: '/core/core',
        },
        {
          text: '装饰器',
          link: '/core/decorator',
        },

      ],
      '/vue/': [
        {
          text: '基础使用',
          link: '/vue/base',
        },
        {
          text: 'phecda-core',
          link: '/vue/phecda-core',
        },
        {
          text: 'module',
          link: '/vue/module',
        },
      ],
      '/server/': [
        {
          text: 'phecda-server',
          collapsed: false,
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
              text: '基础知识',
              link: '/server/base',
            },
            {
              text: '规范',
              link: '/server/standard',
            },
          ],
        },
        {
          text: 'aop装饰器',
          collapsed: false,
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
              text: '过滤器',
              link: '/server/aop/filter',
            },
            {
              text: '插件',
              link: '/server/aop/plugin',
            },
            {
              text: 'extension',
              link: '/server/aop/extension',
            },

          ],
        },

        {
          text: '进阶',
          collapsed: false,
          items: [
            {
              text: '模块运用(必读)',
              link: '/server/advance/module',
            },
            {
              text: '并行请求',
              link: '/server/advance/parallel-route',
            },

            {
              text: 'phecda-core',
              link: '/server/advance/phecda-core',
            },

            {
              text: '限制',
              link: '/server/advance/limit',
            },
            {
              text: '命令行',
              link: '/server/advance/command',
            },
            {
              text: '打包',
              link: '/server/advance/bundle',
            },
            {
              text: '跨项目',
              link: '/server/advance/cross-project',
            },
            {
              text: '热更新',
              link: '/server/advance/hmr',
            },
            {
              text: '自定义功能',
              link: '/server/advance/custom',
            },
            {
              text: 'bun/deno',
              link: '/server/advance/bun-or-deno',
            },
          ],
        },
        {
          text: '微服务',
          collapsed: true,
          items: [
            {
              text: '基础使用',
              link: '/server/rpc/base',
            },
            {
              text: 'rabbitmq',
              link: '/server/rpc/rabbitmq',
            },
            {
              text: 'redis',
              link: '/server/rpc/redis',
            },
            {
              text: 'kafka',
              link: '/server/rpc/kafka',
            },
          ],
        },
        {
          text: '其他',
          collapsed: true,
          items: [
            {
              text: '和其他框架比较',
              link: '/server/other/compare',
            },
            {
              text: '灵感来源',
              link: '/server/other/inspire',
            },
            {
              text: '类型杂技',
              link: '/server/other/types',
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
