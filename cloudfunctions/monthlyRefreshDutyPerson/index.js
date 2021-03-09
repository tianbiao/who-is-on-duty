// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const queryResult = await db.collection('activities')
  .where({
    rotate: '每月'
  })
  .get()

  console.log('queryResult:', queryResult)
  let activities = queryResult.data;
  for(const index in activities){
    const activity = activities[index];
    const currentOnDutyUserIndex = activity.participators.findIndex(e => e === activity.on_duty_user);
    const nextOnDutyUserIndex = currentOnDutyUserIndex < activity.participators.length - 1 ? currentOnDutyUserIndex + 1 : 0;
    await db.collection('activities').doc(activity._id).update({
      data: {
        on_duty_user: activity.participators[nextOnDutyUserIndex]
      }
    })
  }

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}
