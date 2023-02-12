<template>
  <div class="main">
    <a-form id="formLogin" class="user-layout-login" ref="formLogin" :form="form" @submit="handleSubmit">
      <a-tabs
        :activeKey="customActiveKey"
        :tabBarStyle="{ textAlign: 'center', borderBottom: 'unset' }"
        @change="handleTabClick"
      >
        <a-tab-pane key="tab1" :tab="$t('user.login.tab-login-credentials')">
          <a-alert
            v-if="isLoginError"
            type="error"
            showIcon
            style="margin-bottom: 24px"
            :message="$t('user.login.message-invalid-credentials')"
          />
          <a-form-item>
            <a-input
              size="large"
              type="text"
              :placeholder="$t('user.login.username.placeholder')"
              v-decorator="[
                'username',
                {
                  rules: [
                    { required: true, message: $t('user.userName.required') },
                    { validator: handleUsernameOrEmail }
                  ],
                  validateTrigger: 'change'
                }
              ]"
            >
              <a-icon slot="prefix" type="user" :style="{ color: 'rgba(0,0,0,.25)' }" />
            </a-input>
          </a-form-item>

          <a-form-item>
            <a-input-password
              size="large"
              :placeholder="$t('user.login.password.placeholder')"
              v-decorator="[
                'password',
                { rules: [{ required: true, message: $t('user.password.required') }], validateTrigger: 'blur' }
              ]"
            >
              <a-icon slot="prefix" type="lock" :style="{ color: 'rgba(0,0,0,.25)' }" />
            </a-input-password>
          </a-form-item>

          <a-form-item>
            <a-radio-group size="large" @change="loginAccount" button-style="solid">
              <a-radio-button value="a">测试账号1</a-radio-button>
              <a-radio-button value="b">测试账号2</a-radio-button>
              <a-radio-button value="c">超级管理员</a-radio-button>
            </a-radio-group>
          </a-form-item>
        </a-tab-pane>
      </a-tabs>

      <a-form-item style="margin-top: 24px">
        <a-button
          size="large"
          type="primary"
          htmlType="submit"
          class="login-button"
          :loading="state.loginBtn"
          :disabled="state.loginBtn"
        >{{ loginStr || $t('user.login.login') }}</a-button
        >
      </a-form-item>
    </a-form>

    <two-step-captcha
      v-if="requiredTwoStepCaptcha"
      :visible="stepCaptchaVisible"
      @success="stepCaptchaSuccess"
      @cancel="stepCaptchaCancel"
    ></two-step-captcha>
  </div>
</template>

<script>
import TwoStepCaptcha from '@/components/tools/TwoStepCaptcha'
import { mapActions } from 'vuex'
import { getSmsCaptcha, requestLogin, getUserByToken } from '@/api/login'
import { getNavigationBar } from '@/api/permission'
import store from '@/store'
import { welcome } from '@/utils/util'

export default {
  components: {
    TwoStepCaptcha
  },
  data () {
    return {
      customActiveKey: 'tab1',
      loginStr: '',
      loginBtn: false,
      // login type: 0 email, 1 username, 2 telephone
      loginType: 0,
      isLoginError: false,
      accounts: '',
      requiredTwoStepCaptcha: false,
      stepCaptchaVisible: false,
      form: this.$form.createForm(this),
      state: {
        time: 60,
        loginBtn: false,
        // login type: 0 email, 1 username, 2 telephone
        loginType: 0,
        smsSendBtn: false
      }
    }
  },
  created () {},
  methods: {
    ...mapActions(['Login', 'Logout']),
    loginAccount (key) {
      if (key.target.value === 'a') {
        this.form.setFieldsValue({
          username: 'test',
          password: 'test'
        })
      } else if (key.target.value === 'b') {
        this.form.setFieldsValue({
          username: 'test2',
          password: 'test2'
        })
      } else {
        this.form.setFieldsValue({
          username: 'blogadmin',
          password: 'blogadmin'
        })
      }
    },
    // handler
    handleUsernameOrEmail (rule, value, callback) {
      const { state } = this
      const regex = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/
      if (regex.test(value)) {
        state.loginType = 0
      } else {
        state.loginType = 1
      }
      callback()
    },
    handleTabClick (key) {
      this.customActiveKey = key
      // this.form.resetFields()
    },
    handleSubmit (e) {
      e.preventDefault()
      const {
        form: { validateFields },
        state,
        customActiveKey
      } = this

      state.loginBtn = true

      const validateFieldsKey = customActiveKey === 'tab1' ? ['username', 'password'] : ['mobile', 'captcha']

      validateFields(validateFieldsKey, { force: true }, (err, values) => {
        if (!err) {
          console.log('login form', values)
          const loginParams = { ...values }
          delete loginParams.username
          delete loginParams.password
          loginParams[!state.loginType ? 'email' : 'name'] = values.username
          loginParams['pass'] = values.password
          requestLogin(loginParams)
            .then((res) => this.loginSuccess(res))
            .catch((err) => this.requestFailed(err))
            .finally(() => {
              state.loginBtn = false
            })
        } else {
          setTimeout(() => {
            state.loginBtn = false
          }, 600)
        }
      })
    },
    getCaptcha (e) {
      e.preventDefault()
      const {
        form: { validateFields },
        state
      } = this

      validateFields(['mobile'], { force: true }, (err, values) => {
        if (!err) {
          state.smsSendBtn = true

          const interval = window.setInterval(() => {
            if (state.time-- <= 0) {
              state.time = 60
              state.smsSendBtn = false
              window.clearInterval(interval)
            }
          }, 1000)

          const hide = this.$message.loading('验证码发送中..', 0)
          getSmsCaptcha({ mobile: values.mobile })
            .then((res) => {
              setTimeout(hide, 2500)
              this.$notification['success']({
                message: '提示',
                description: '验证码获取成功，您的验证码为：' + res.result.captcha,
                duration: 8
              })
            })
            .catch((err) => {
              setTimeout(hide, 1)
              clearInterval(interval)
              state.time = 60
              state.smsSendBtn = false
              this.requestFailed(err)
            })
        }
      })
    },
    stepCaptchaSuccess () {
      this.loginSuccess()
    },
    stepCaptchaCancel () {
      this.Logout().then(() => {
        this.loginBtn = false
        this.stepCaptchaVisible = false
      })
    },
    loginSuccess (data) {
      const _this = this
      console.log(data)
      if (!data.success) {
        this.isLoginError = true
        this.$notification['error']({
          message: '错误',
          description: data.msg || '请求出现错误，请稍后再试',
          duration: 4
        })
      } else {
        const token = data.response.token
        window.localStorage.setItem('Token', token)
        const curTime = new Date()
        const expiredate = new Date(curTime.setSeconds(curTime.getSeconds() + data.response.expires_in))
        window.localStorage.setItem('TokenExpire', expiredate)
        window.localStorage.refreshtime = expiredate
        window.localStorage.expires_in = data.response.expires_in
        _this.loginStr = '成功获取Token，等待服务器返回用户信息...'
        _this.getUserInfoByToken(token)
      }
    },
    getUserInfoByToken (token) {
      const _this = this
      const loginParams = { token: token }
      getUserByToken(loginParams)
        .then((data) => {
          if (!data.success) {
            this.isLoginError = true
            this.$notification['error']({
              message: '错误',
              description: data.msg || '请求出现错误，请稍后再试',
              duration: 4
            })
          } else {
            _this.loginStr = '接收到用户数据，开始初始化路由树...'
            var result = data.response
            store.commit('SET_NAME', { name: result.uRealName, welcome: welcome() })
            store.commit('SET_AVATAR', result.avatar || 'https://img.neters.club/github/blogadmin.png')
            store.commit('SET_INFO', result)
            window.localStorage.user = JSON.stringify(result)
            if (result.uID > 0) {
              _this.GetNavigationBar(result.uID)
            }
          }
        })
        .catch((err) => {
          this.loginStr = ''
          console.log(err)
        })
    },
    // 获取路由树
    GetNavigationBar (uid) {
      var _this = this
      var loginParams = { uid: uid, t: new Date() }
      getNavigationBar(loginParams)
        .then((data) => {
          if (!data.success) {
            this.isLoginError = true
            this.$notification['error']({
              message: '错误',
              description: data.msg || '请求出现错误，请稍后再试',
              duration: 4
            })
          } else {
            _this.$message.success('后台初始化成功')
            const userinfo = JSON.parse(window.localStorage.user ? window.localStorage.user : null)
            _this.$message.info(
              `登录成功 \n 欢迎管理员：${userinfo.uRealName} ！Token 将在 ${
                window.localStorage.expires_in / 60
              } 分钟后过期！`
            )

            window.localStorage.setItem('set_routers', JSON.stringify(data.response))

            this.$router.push({ path: _this.$route.query.redirect ? _this.$route.query.redirect : '/' })
            this.isLoginError = false
          }
        })
        .catch((err) => {
          this.loginStr = ''
          window.localStorage.removeItem('Token')
          window.localStorage.removeItem('set_routers')
          console.log(err)
        })
    },
    requestFailed (err) {
      this.isLoginError = true
      this.$notification['error']({
        message: '错误',
        description: ((err.response || {}).data || {}).message || '请求出现错误，请稍后再试',
        duration: 4
      })
    }
  }
}
</script>

<style lang="less" scoped>
.user-layout-login {
  label {
    font-size: 14px;
  }

  .getCaptcha {
    display: block;
    width: 100%;
    height: 40px;
  }

  .forge-password {
    font-size: 14px;
  }

  button.login-button {
    padding: 0 15px;
    font-size: 16px;
    height: 40px;
    width: 100%;
  }

  .user-login-other {
    text-align: left;
    margin-top: 24px;
    line-height: 22px;

    .item-icon {
      font-size: 24px;
      color: rgba(0, 0, 0, 0.2);
      margin-left: 16px;
      vertical-align: middle;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: #1890ff;
      }
    }

    .register {
      float: right;
    }
  }
}
</style>
