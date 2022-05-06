import router from './router'
import NProgress from 'nprogress' // progress bar
import '@/components/NProgress/nprogress.less' // progress bar custom style
import { setDocumentTitle, domTitle } from '@/utils/domUtil'
import { i18nRender } from '@/locales'
import store from './store'
import { welcome } from '@/utils/util'
import { generatorShowDynamicRouter } from '@/router/generator-routers'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const allowList = ['login', 'register', 'registerResult'] // no redirect allowList
const loginRoutePath = '/user/login'
const defaultRoutePath = '/dashboard/workplace'

router.beforeEach((to, from, next) => {
  NProgress.start() // start progress bar
  to.meta && typeof to.meta.title !== 'undefined' && setDocumentTitle(`${i18nRender(to.meta.title)} - ${domTitle}`)
  /* has token */
  var token = window.localStorage.Token
  if (token) {
    if (to.path === loginRoutePath) {
      next({ path: defaultRoutePath })
      NProgress.done()
    } else {
      var nav = JSON.parse(window.localStorage.getItem('set_routers'))
      if (nav && nav.length > 0) {
        if (store.getters.addRouters.length === 0) {
          var routers = generatorShowDynamicRouter(nav)
          routers.forEach((r) => {
            router.addRoute(r)
          })

          var result = JSON.parse(window.localStorage.user)
          store.commit('SET_NAME', { name: result.uRealName, welcome: welcome() })
          store.commit('SET_AVATAR', result.avatar || 'https://img.neters.club/github/blogadmin.png')
          store.commit('SET_INFO', result)

          // 请求带有 redirect 重定向时，登录自动重定向到该地址
          const redirect = decodeURIComponent(from.query.redirect || to.path)
          if (to.path === redirect) {
            // set the replace: true so the navigation will not leave a history record
            next({ ...to, replace: true })
          } else {
            // 跳转到目的路由
            next({ path: redirect })
          }
        } else {
          next()
        }
      } else {
        // login
        window.localStorage.removeItem('Token')
        next({ path: loginRoutePath })
        NProgress.done()
      }
    }
  } else {
    if (allowList.includes(to.name)) {
      // 在免登录名单，直接进入
      next()
    } else {
      next({ path: loginRoutePath, query: { redirect: to.fullPath } })
      NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
    }
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})
