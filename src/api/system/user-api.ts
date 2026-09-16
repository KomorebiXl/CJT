import type { UserInfo } from '@/types/user'
import type {
  UserData,
  UserDeptTreeSelectData,
  UserDetailData,
  UserDetailDataByUserId,
  UserFormData,
  UserProfileResult,
  UserProfileUpdateParams,
  UserSearchParams
} from '@/types/system/user'
import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import {
  encryptWithSm2,
  encryptWithSM4,
  generateRandomSymmetricKey
} from '@/utils/jsencrypt.ts'

const userBaseUrl = '/system/user'

/**
 * @description 获取用户详情信息
 * @param subjectId 项目/主体标识，切换项目作用域时按项目拉取权限标识
 */
export const getUserInfo = (subjectId?: string) => {
  return request.get<UserInfo>({
    url: '/getInfo',
    params: subjectId ? { subjectId } : undefined
  })
}

export const getUserDataAPI = createListAPI<UserSearchParams, UserData>(
  `${userBaseUrl}/list`
)

export const createUserAPI = (data: UserFormData) =>
  request.post<BaseResponse>({ url: userBaseUrl, data })

export const getUserDetailAPI = (id: number) =>
  request.get<BaseResponse & UserDetailDataByUserId>({
    url: `${userBaseUrl}/${id}`
  })

export const updateUserAPI = (
  data: UserFormData & { userId: string | number }
) => request.put<BaseResponse>({ url: userBaseUrl, data })

export const deleteUserAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({ url: `${userBaseUrl}/delete`, data })

export const getDeepTreeData = () =>
  request.get<DataResponse<Array<UserDeptTreeSelectData>>>({
    url: `${userBaseUrl}/deptTree`
  })

export const getUserDetailData = () =>
  request.get<UserDetailData>({ url: `${userBaseUrl}/` })

export const changeUserStatusAPI = (data: { userId: number; status: string }) =>
  request.put<BaseResponse>({ url: `${userBaseUrl}/changeStatus`, data })

export const resetUserPasswordAPI = (userId: number, password: string) => {
  // 生成随机对称密钥、IV
  const { symmetricKey, iv } = generateRandomSymmetricKey()
  // 使用公钥对对称密钥进行非对称加密
  const encryptedSymmetricKey = encryptWithSm2(symmetricKey)
  // 使用对称密钥对密码进行加密
  const encryptedPassword = encryptWithSM4(password, symmetricKey, iv)
  const data = {
    userId,
    password: encryptedPassword,
    symmetricKey: encryptedSymmetricKey,
    iv
  }
  return request.put<BaseResponse>({
    url: `${userBaseUrl}/resetPwd`,
    data
  })
}

export const getUserProfileAPI = () =>
  request.get<UserProfileResult>({ url: `${userBaseUrl}/profile` })

export const updateUserProfileAPI = (data: UserProfileUpdateParams) =>
  request.put<BaseResponse>({ url: `${userBaseUrl}/profile`, data })

export const updateUserPwdAPI = (oldPassword: string, newPassword: string) => {
  // 生成随机对称密钥、IV
  const { symmetricKey, iv } = generateRandomSymmetricKey()
  // 使用公钥对对称密钥进行非对称加密
  const encryptedSymmetricKey = encryptWithSm2(symmetricKey)
  // 使用对称密钥对旧/新密码进行加密，经 query 参数提交
  const params = {
    oldPassword: encryptWithSM4(oldPassword, symmetricKey, iv),
    newPassword: encryptWithSM4(newPassword, symmetricKey, iv),
    symmetricKey: encryptedSymmetricKey,
    iv
  }
  return request.put<BaseResponse>({
    url: `${userBaseUrl}/profile/updatePwd`,
    params
  })
}

export const uploadAvatarAPI = (data: FormData) =>
  request.post<BaseResponse & { imgUrl: string }>({
    url: `${userBaseUrl}/profile/avatar`,
    data
  })
