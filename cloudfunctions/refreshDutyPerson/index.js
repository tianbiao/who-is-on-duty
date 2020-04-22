// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const queryResult = await db.collection('teams')
  // .where({
  //   name: 'PSA'
  // })
  .get()

  let teams = queryResult.data;
  for(const index in teams){
    let activities = teams[index].activities
    for(const index in activities){
      const currentOnDutyUserIndex = activities[index].participators.findIndex(e => e === activities[index].onDutyUser)
      const nextOnDutyUserIndex = currentOnDutyUserIndex < activities[index].participators.length - 1 ? currentOnDutyUserIndex + 1 : 0  
      activities[index].onDutyUser = activities[index].participators[nextOnDutyUserIndex]
    }
    await db.collection('teams').doc(teams[index]._id).update({
      data: {
        activities: activities
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