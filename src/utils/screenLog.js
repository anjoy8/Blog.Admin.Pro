/* eslint-disable */
export const printANSI = () => {
  // console.clear()
  console.log('[blog.admin pro] created()')
  // ASCII - ANSI Shadow
  let text = `

  ██████╗ ██╗      ██████╗  ██████╗     █████╗ ██████╗ ███╗   ███╗██╗███╗   ██╗    ██████╗ ██████╗  ██████╗ 
  ██╔══██╗██║     ██╔═══██╗██╔════╝    ██╔══██╗██╔══██╗████╗ ████║██║████╗  ██║    ██╔══██╗██╔══██╗██╔═══██╗
  ██████╔╝██║     ██║   ██║██║  ███╗   ███████║██║  ██║██╔████╔██║██║██╔██╗ ██║    ██████╔╝██████╔╝██║   ██║
  ██╔══██╗██║     ██║   ██║██║   ██║   ██╔══██║██║  ██║██║╚██╔╝██║██║██║╚██╗██║    ██╔═══╝ ██╔══██╗██║   ██║
  ██████╔╝███████╗╚██████╔╝╚██████╔╝██╗██║  ██║██████╔╝██║ ╚═╝ ██║██║██║ ╚████║    ██║     ██║  ██║╚██████╔╝
  ╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝ ╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝    ╚═╝     ╚═╝  ╚═╝ ╚═════╝ 
                                                                                                               
\t\t\t\t\tPublished ${APP_VERSION}- @ neters.club
\t\t\t\t\tBuild date: ${BUILD_DATE}`
  console.log(`%c${text}`, 'color: #0099ff')
  console.log('%c感谢使用 blog.admin pro!', 'color: #0099ff; font-size: 14px;    font-family: Hiragino Sans GB,Microsoft YaHei,\\\\5FAE\\8F6F\\96C5\\9ED1,Droid Sans Fallback,Source Sans,Wenquanyi Micro Hei,WenQuanYi Micro Hei Mono,WenQuanYi Zen Hei,Apple LiGothic Medium,SimHei,ST Heiti,WenQuanYi Zen Hei Sharp,sans-serif;')
}
