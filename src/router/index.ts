import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import FlowEditor from '../views/FlowEditor.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/flow/:id',
      name: 'flow-editor',
      component: FlowEditor,
    },
  ],
})

export default router