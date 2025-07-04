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
          text: 'aop',
          collapsed: false,
          items: [
            {
              text: '上下文',
              link: '/server/aop/ctx',
            },
            {
              text: '自定义元数据',
              link: '/server/aop/define',
            },

            {
              text: '守卫',
              link: '/server/aop/guard',
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
              link: '/server/aop/addon',
            },
            {
              text: '扩展',
              link: '/server/aop/extension',
            },

          ],
        },
        {
          text: '功能',
          items: [
            {
              text: '依赖注入',
              link: '/server/feature/dep-inject',
            },
            {
              text: '初始化/事件总线/错误处理',
              link: '/server/feature/phecda-core',
            },

            {
              text: '日志',
              link: '/server/feature/log',
            },
            {
              text: '内置模块',
              link: '/server/feature/internal-module',
            },
            {
              text: '文件上传',
              link: '/server/feature/file-upload',
            },
          ],
        },
        {
          text: '进阶',
          collapsed: false,
          items: [
            {
              text: '多重继承',
              link: '/server/advance/multi-extend',
            },
            {
              text: '并行请求',
              link: '/server/advance/parallel-route',
            },
            {
              text: '模块外',
              link: '/server/advance/outside-module',
            },
            {
              text: '单元测试',
              link: '/server/advance/test',
            },
            {
              text: '热更新',
              link: '/server/advance/hmr',
            },
            {
              text: 'OpenAPI/Swagger',
              link: '/server/advance/openapi',
            },
            {
              text: '自定义功能',
              link: '/server/advance/custom',
            },
          ],
        },
        {
          text: 'rpc',
          items: [
            {
              text: 'websocket/electron',
              link: '/server/rpc/ws&electron',
            },
            {
              text: '微服务',
              link: '/server/rpc/rpc',
            },
          ],
        },
        {
          text: '构建',
          items: [
            {
              text: '库模块',
              link: '/server/build/module-as-lib',
            },
            {
              text: '前后端跨项目',
              link: '/server/build/cross-project',
            },
            {
              text: '打包',
              link: '/server/build/bundle',
            },

          ],
        },
        {
          text: '运行时',
          items: [
            {
              text: '命令行',
              link: '/server/runtime/command',
            },
            {
              text: '环境变量',
              link: '/server/runtime/environment',
            },
            {
              text: '自动引入',
              link: '/server/runtime/unimport',
            },
          ],
        },
        {
          text: '须知',
          items: [
            {
              text: '限制',
              link: '/server/must-know/limit',
            },
            {
              text: '一些问题',
              link: '/server/must-know/problem',
            },
          ],
        },

        {
          text: '其他',
          collapsed: true,
          items: [

            {
              text: 'bun/deno',
              link: '/server/other/bun-or-deno',
            },
            {
              text: '类型杂技',
              link: '/server/other/types',
            },

          ],
        },
      ],

    },
  },
})
