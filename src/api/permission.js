import request from '@/utils/request'

const userApi = {
  GetNavigationBar: '/permission/GetNavigationBarPro'
}

export function getNavigationBar (parameter) {
  return request({
    url: userApi.GetNavigationBar,
    method: 'get',
    params: parameter
  })
}
