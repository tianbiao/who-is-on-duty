const util = require('../../utils/util.js');

const app = getApp()

Page({
  data: {
    today: util.formatDate(new Date()),
    ondutyData: [],
    hasUserInfo: false
  },
  //事件处理函数
  manageActivity(event) {
    const activity = event.currentTarget.dataset.activtityname;
    const team = event.currentTarget.dataset.teamname;
    wx.navigateTo({
      url: '../activity/activity?team=' + team + '&activity=' + activity,
    });
  },
  manageTeam(event) {
    const teamId = event.currentTarget.dataset.teamid;
    wx.navigateTo({
      url: '../team/team?teamid=' + teamId,
    });
  },
  onLoad: function () {
    wx.showShareMenu({
      withShareTicket: true,
    });
  },
  loadData() {
    if(app.globalData.ondutyData){
      this.setData({
        ondutyData: app.globalData.ondutyData,
        hasUserInfo: true
      })
    }
  }
});
