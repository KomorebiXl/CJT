import { loginApi, logout } from '@/api/login-api.ts'
import { getUserInfo } from '@/api/system/user-api.ts'
import type { UserState, LoginFormData } from '@/types/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import {
  encryptWithSM4,
  encryptWithSm2,
  generateRandomSymmetricKey
} from '@/utils/jsencrypt'
import defaultAvatar from '@/assets/images/defaultAvatar.png'

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: getToken(),
    name: '',
    avatar: '',
    roles: [],
    permissions: [],
    nickName: '',
    loginTime: '',
    username: ''
  }),
  actions: {
    setUserPermission(roles: Array<string>, permissions: Array<string>) {
      if (roles && roles.length !== 0) {
        this.roles = roles
        this.permissions = permissions
      } else {
        this.roles = ['ROLE_DEFAULT']
      }
    },

    handleLogin(loginFormData: LoginFormData) {
      // 生成随机对称密钥、IV
      const { symmetricKey, iv } = generateRandomSymmetricKey()
      // 使用公钥对对称密钥进行非对称加密
      const encryptedSymmetricKey = encryptWithSm2(symmetricKey)
      // 使用对称密钥对密码进行加密
      const encryptedPassword = encryptWithSM4(
        loginFormData.password,
        symmetricKey,
        iv
      )
      const params: LoginFormData = {
        username: loginFormData.username,
        password: encryptedPassword,
        symmetricKey: encryptedSymmetricKey,
        iv,
        code: loginFormData.code,
        uuid: loginFormData.uuid
      }
      return new Promise((resolve, reject) => {
        loginApi(params)
          .then(res => {
            setToken(res.token)
            this.token = res.token
            resolve(res)
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    handleGetUserInfo(subjectId?: string) {
      return new Promise((resolve, reject) => {
        getUserInfo(subjectId)
          .then(res => {
            const { userName, avatar, nickName } = res.user
            const userAvatar =
              avatar && avatar.trim()
                ? import.meta.env.VITE_APP_BASE_API + avatar
                : defaultAvatar
            this.setUserPermission(res.roles, res.permissions)
            this.name = userName
            this.nickName = nickName
            this.avatar = userAvatar
            resolve(res)
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    /**
     * @description 按项目作用域刷新账号权限标识（进入项目流程页时使用）
     */
    refreshUserInfo(subjectId: string) {
      return this.handleGetUserInfo(subjectId)
    },

    handleLogout() {
      return new Promise(resolve => {
        logout().finally(() => {
          this.token = ''
          this.roles = []
          this.permissions = []
          removeToken()
          resolve(true)
        })
      })
    }
  }
})
