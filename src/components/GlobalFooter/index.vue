<template>
  <global-footer class="footer custom-render">
    <template v-slot:links>
      <a href="mvp.neters.club" target="_blank">laozhang is MVP</a>
      <a href="https://github.com/anjoy8/Blog.Admin.Pro.git" target="_blank">Github</a>
      <a href="https://neters.club" target="_blank">neters.club</a>
    </template>
    <template v-slot:copyright>
      <a href="https://github.com/vueComponent" target="_blank">vueComponent</a>
    </template>
  </global-footer>
</template>

<script>
import { GlobalFooter } from '@ant-design-vue/pro-layout'

export default {
  name: 'ProGlobalFooter',
  components: {
    GlobalFooter
  }
}
</script>
