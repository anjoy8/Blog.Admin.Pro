<template>
  <div>这是自定义的个人中心页面</div>
</template>

<script>
export default {
  data () {
    return {
      editForm: {
        id: 0,
        uID: 0,
        RID: 0,
        uLoginName: '',
        uRealName: '',
        name: '',
        sex: -1,
        age: 0,
        birth: '',
        desc: '',
        addr: '',
        tdLogo: ''
      },
      token: {
        Authorization: 'Bearer '
      },
      ruleForm: {
        max_ver: '',
        min_ver: '',
        enable: ''
      },
      beforeAvatarUpload (file) {
        const isLt1M = file.size / 1024 / 1024 < 1

        // if (!isJPG) {
        //   this.$message.error('上传头像图片只能是 JPG 格式!')
        // }
        if (!isLt1M) {
          this.$message.error('上传头像图片大小不能超过 1MB!')
        }
        return isLt1M
      }
    }
  },
  methods: {
    onSubmit () {
      this.$message({
        message: '失败！该操作无权限',
        type: 'error'
      })
    },
    handleAvatarSuccess (res, file) {
      this.editForm.tdLogo = '/' + res.response
    },
    fileDownload () {
    }
  },
  mounted () {
    const tokenStr = window.localStorage.Token
    this.token = {
      Authorization: 'Bearer ' + tokenStr
    }

    var user = JSON.parse(window.localStorage.user)
    this.editForm.uRealName = user ? user.uRealName : ''
  }
}
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  text-align: center;
}
.plus-sign {
  line-height: 120px !important;
}
.avatar {
  width: 120px;
  height: 120px;
  display: block;
}

.markdown-body {
  height: 500px !important;
}
</style>
