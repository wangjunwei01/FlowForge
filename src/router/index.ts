import { createRouter, createWebHashHistory } from 'vue-router'
import FlowEditor from '../views/FlowEditor.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'flow-editor',
      component: FlowEditor,
    },
    {
      path: '/flow/:id',
      name: 'flow-editor-with-id',
      component: FlowEditor,
    },
  ],
})

export default router