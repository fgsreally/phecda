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
      { text: 'web', link: '/web/intro', activeMatch: '/web/' },

      // { text: '框架封装', link: '/pack/', activeMatch: '/pack/' },

    ],

    sidebar: {
      '/core/': [
        {
          text: '简介',
          link: '/core/intro',
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
      '/web/': [
        {
          text: 'intro',
          link: '/web/intro',
        },
        {
          text: '基础使用',
          link: '/web/base',
        },
        {
          text: 'api',
          link: '/web/api',
        },
        {
          text: 'phecda-vue',
          link: '/web/vue/base',
        },
        {
          text: 'phecda-react',
          link: '/web/react/base',
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
              text: '灵感来源',
              link: '/server/inspire',
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
              text: '扩展',
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
            {
              text: '微服务',
              link: '/server/advance/rpc',
            },
          ],
        },

        {
          text: '其他',
          collapsed: true,
          items: [

            {
              text: '类型杂技',
              link: '/server/other/types',
            },

            {
              text: '一些问题',
              link: '/server/other/problem',
            },

          ],
        },
      ],

    },
  },
})
