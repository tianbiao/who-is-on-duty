const util = require('../../utils/util.js');

const app = getApp();

Page({
  data: {
    today: util.formatDate(new Date()),
    myTeams: [],
    users: [],
    myActivities: [],
    hasUserInfo: false,
    modal: {
      show: false,
      type: '',
      data: {},
    },
  },
  manageUser: function (event) {
    console.log(event.detail);
  },
  manageActivity: function (event) {
    this.setData({
      modal: {
        show: true,
        type: 'activity',
        data: event.detail,
      },
    });
  },
  manageTeam: function (event) {
    // this.setData({
    //   modal: {
    //     show: true,
    //     type: 'team',
    //     data: event.detail,
    //   },
    // });

    const teamId = event.detail._id;
    wx.navigateTo({
      url: '../team/team?teamid=' + teamId,
    });
  },
  reorderTeam: function (event) {
    console.log(event.detail);
  },
  closeModal: function () {
    this.setData({
      modal: {
        show: false,
        type: '',
        data: {},
      },
    });
  },
  saveData: function (event) {
    console.log(event.detail);
  },
  onLoad: function () {
    wx.showShareMenu({
      withShareTicket: true,
    });
  },
  loadData() {
    if (app.globalData.teams) {
      this.setData({
        myTeams: app.globalData.teams,
        myActivities: app.globalData.activities.filter(a => a.on_duty_user._id === app.globalData.user._id),
        hasUserInfo: true,
      });
    }
  },
});
