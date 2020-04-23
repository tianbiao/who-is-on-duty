const util = require('../../utils/util.js');

const app = getApp();
const db = wx.cloud.database();
const _ = db.command

Page({
  data: {
    today: util.formatDate(new Date()),
    ondutyData: [],
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },
  //事件处理函数
  manageActivity: function (event) {
    const activity = event.currentTarget.dataset.activtityname;
    const team = event.currentTarget.dataset.teamname;
    wx.navigateTo({
      url: '../activity/activity?team=' + team + '&activity=' + activity,
    });
  },
  onLoad: function () {
    this.getUserOpenId()

    wx.showShareMenu({
      withShareTicket: true,
    });
  },
  async getUserInfo(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true,
    })
    await this.createOrUpdateUser(e.detail.userInfo.nickName)
    this.loadActivities()
  },
  async getUserOpenId() {
    const result = await wx.cloud.callFunction({
      name: 'getOpenId'
    })
    app.globalData.userOpenId = result.result.openid

    const userDate = await this.findUserByOpenId()
    if(userDate.length == 0){
    } else {
      app.globalData.userName = userDate[0].name
      app.globalData.user = userDate[0]
      this.setData({
        hasUserInfo: true
      });
      this.loadActivities()
    }
  },
  async findUserByOpenId(openId) {
    const userQueryResult = await db.collection('users').where({
      _openid: app.globalData.userOpenId
    }).get()
    return userQueryResult.data
  },
  async createOrUpdateUser(name) {
    await db.collection('users').add({
      data: {
        name: name
      }
    })
  },
  updateUserName(name) {
    db.collection('users').doc(app.globalData.userOpenId).update({
      data: {
        name: name
      }
    })
  },
  loadActivities() {
    const self = this;
    db.collection('teams')
    .where({
      name: _.in(app.globalData.user.teams)
    })
      .get({
        success: function (res) {
          console.log('Data', res.data);
          const ondutyData = res.data;
          ondutyData.unshift({
            name: '我的值班',
            activities: [],
          });
          self.setData({
            ondutyData,
          });
          app.globalData.ondutyData = ondutyData;
        },
      });
  },
});
