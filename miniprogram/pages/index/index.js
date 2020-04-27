const util = require('../../utils/util.js');

const app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    today: util.formatDate(new Date()),
    myTeams: [],
    users: [],
    myActivities: [],
    hasUserInfo: false,
    invitedTeam: null,
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
    this.setData({
      modal: {
        show: true,
        type: 'team',
        data: event.detail,
      },
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
  saveData: async function (event) {
    const { type, data } = event.detail;
    switch (type) {
      case 'activity':
        await this.saveActivity(data);
        break;
      case 'team':
        await this.saveTeam(data);
        break;
      default:
        console.log('?');
    }
    this.closeModal();
  },
  saveActivity: function ({ activity: { _id }, name, desc, onDutyUser: { _id: on_duty_user }, participators, rotate }) {
    return db.collection('activities').doc(_id).update({
      data: {
        name,
        desc,
        bgimg,
        rotate,
        on_duty_user,
        participators: participators.map(e => e._id),
      },
    });
  },
  saveTeam: function ({ team: { _id }, name }) {
    return db.collection('teams').doc(_id).update({
      data: {
        name,
      },
    });
  },
  inviteTeamMember: function (event) {
    const { name, _id } = event.detail;
    const userName = app.globalData.user.name;
    return {
      title: userName + '邀请你加入: ' + name,
      path: 'pages/index/index?invitedTeam=' + _id,
      success() {
        wx.showShareMenu({
          withShareTicket: true,
        });
      },
    };
  },
  onLoad: function (options) {
    wx.showShareMenu({
      withShareTicket: true,
    });
    const { invitedTeam } = options;
    this.setData({ invitedTeam });
  },
  addUserToTeam: async function (invitedTeam) {
    const { teams, user } = app.globalData;
    if (teams.some(t => t._id === invitedTeam)) {
      wx.showToast({
        title: '你已经加入过该团队了',
        icon: 'success',
        duration: 2000,
      });
    } else {
      user.teams.push(invitedTeam);
      await Promise.all([
        db.collection('users').doc(user._id).update({
          data: {
            teams: app.globalData.user.teams,
          },
        }),
        db.collection('teams').doc(invitedTeam).update({
          data: {
            members: _.push(user._id),
          },
        }),
      ]);

      const teamQueryResult = await db.collection('teams').where({
        _id: _.in(user.teams),
      }).get();
      app.globalData.teams = teamQueryResult.data;
      wx.showToast({
        title: '加入成功',
        icon: 'success',
        duration: 2000,
      });
    }
  },
  loadData: async function () {
    if (app.globalData.teams) {
      const { invitedTeam } = this.data;
      invitedTeam && await this.addUserToTeam(invitedTeam);
      this.setData({
        myTeams: app.globalData.teams,
        myActivities: app.globalData.activities.filter(a => a.on_duty_user._id === app.globalData.user._id),
        hasUserInfo: true,
      });
    }
  },
});
