import Vue from 'vue'
import Router from 'vue-router'
import Settings from '@/components/Settings'
import Home from '@/components/Home'
import Meter from '@/components/Meter'
import List from '@/components/List'


Vue.use(Router)

const router =  new Router({
  routes: [
    {
      path: '/settings',
      component: Settings,
      meta: { isPublic: true }
    },
    {
      path: '/home',
      component: Home,
      meta: { isPublic: true }
    },
    {
      path: '/meter',
      component: Meter,
      meta: { isPublic: true }
    },
    {
      path: '/list',
      component: List,
      meta: { isPublic: true }
    },
    { path: '*', redirect: '/home' }
  ],
  linkActiveClass : 'active',
  onError(e){
    console.error('Router Error',e);
  }
})
/*
// Auth Handling
router.beforeEach((to, from, next) => {
  
  if (to.matched.every(record => record.meta.isPublic)) {
    next() // make sure to always call next()!
  } else {
    // this route requires auth, check if logged in
    // if not, redirect to login page or Login Modal
    checkLoggedIn(this.a.app).then(ok=>{
      ok ? next() : next({path: '/login',query: {redirect:to.fullPath}})
      // ok ? next() : next('/login')      
    }).catch(error=>{
      console.error('route error',error);
      next(error)
    })
  }
})*/


export default router;