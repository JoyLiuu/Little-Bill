<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'

onLaunch(() => {
  const userStore = useUserStore()
  userStore.initUserInfo()
})

onShow(() => {})

onHide(() => {})
</script>
<style lang="scss">
	/* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
	@import "uview-plus/theme.scss";
	@import "uview-plus/index.scss";
</style>
<style>
/* 小程序适配 */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
