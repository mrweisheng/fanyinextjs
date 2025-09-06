import { redirect } from 'next/navigation'

export default function Home() {
  // 重定向到翻译页面作为默认首页
  redirect('/translate')
}
