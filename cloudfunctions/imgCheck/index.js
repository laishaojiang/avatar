// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const {fileID} = event
  const res = await cloud.downloadFile({ fileID })
  console.log(res)
  const buffer = res.fileContent
  const result = await cloud.openapi.security.imgSecCheck({
    media: {
      contentType: 'image/png',
      value: buffer
    }
  })
  console.log(result)
  return {
    errCode: result.errCode,
  }
}