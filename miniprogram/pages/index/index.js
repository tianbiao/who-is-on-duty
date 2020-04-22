const util = require('../../utils/util.js');

const app = getApp();
const db = wx.cloud.database();

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
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true,
      });
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
        });
      };
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo;
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true,
          });
        },
      });
    }

    this.loadActivities();

    wx.showShareMenu({
      withShareTicket: true,
    });
  },
  getUserInfo: function (e) {
    console.log(e);
    app.globalData.userInfo = e.detail.userInfo;
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true,
    });
  },

  loadActivities: function () {
    const self = this;
    db.collection('teams')
    // .where({
    //   name: 'PSA'
    // })
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
