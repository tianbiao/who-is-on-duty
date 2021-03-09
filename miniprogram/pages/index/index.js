const util = require('../../utils/util.js');

const app = getApp();
const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    today: util.formatDate(new Date()),
    myTeams: [],
    users: [],
    myActivities: [],
    hasUserInfo: false,
    invitedTeam: null,
    loading: true,
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
    const { user } = app.globalData;
    const { myTeams } = this.data;
    const idx = myTeams.findIndex((team) => (team._id === event.detail._id));
    const team = myTeams.splice(idx, 1)[0];
    myTeams.unshift(team);
    user.teams = myTeams.map(team => (team._id));
    db.collection('users').doc(user._id).update({
      data: {
        teams: user.teams,
      },
    });
    this.setData({
      myTeams,
    });
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
    console.log(event.detail);
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
  saveActivity: async function (activity) {
    const { _id, teamId, name, desc, onDutyUser: { _id: on_duty_user }, participators, rotate, bgimg } = activity;
    const { myActivities, myTeams } = this.data;
    if (_id) {
      await db.collection('activities').doc(_id).update({
        data: {
          name,
          desc,
          bgimg,
          rotate,
          on_duty_user,
          participators: participators.map(e => e._id),
        },
      });
      const activityIdx = myActivities.findIndex(thisActivity => (thisActivity._id === _id));
      activityIdx > -1 && this.setData({
        [`myActivities[${activityIdx}]`]: activity,
      });
      const teamIdx = myTeams.findIndex(team => (team.activity_ids.includes(_id)));
      const teamActivityIdx = myTeams[teamIdx].activities.findIndex(thisActivity => (thisActivity._id === _id));
      this.setData({
        [`myTeams[${teamIdx}].activities[${teamActivityIdx}]`]: activity,
      });
    } else {
      const { _id } = await db.collection('activities').add({
        data: {
          name,
          desc,
          bgimg,
          rotate,
          on_duty_user,
          participators: participators.map(e => e._id),
        },
      });
      await db.collection('teams').doc(teamId).update({
        data: {
          activity_ids: _.push(_id),
        },
      });
      activity._id = _id;
      const { myActivities, myTeams } = this.data;
      myActivities.push(activity);
      this.setData({ myActivities });
      const teamIdx = myTeams.findIndex((team) => (team._id === teamId));
      const teamActivities = myTeams[teamIdx].activities;
      teamActivities.push(activity);
      this.setData({
        [`myTeams[${teamIdx}].activities`]: teamActivities,
      });
    }
    this.setData({
      myTeams: [],
    });
    this.setData({
      myTeams,
    });
  },
  saveTeam: function ({ team: { _id }, name }) {
    return db.collection('teams').doc(_id).update({
      data: {
        name,
      },
    });
  },
  onShareAppMessage(options) {
    const userName = app.globalData.user.name;
    const name = app.globalData.invitedTeamName;
    const id = app.globalData.invitedTeamId;
    if (options && options.from == 'button') {
      return {
        title: `${userName} 邀请你加入: ${name}`,
        path: 'pages/index/index?invitedTeam=' + id,
        success() {
          wx.showShareMenu({
            withShareTicket: true,
          });
        },
      };
    }
  },
  onLoad: function (options) {
    wx.showShareMenu({
      withShareTicket: true,
    });
    const { invitedTeam } = options;
    this.setData({ invitedTeam });
  },
  addUserToTeam: async function (invitedTeam) {
    const { user } = app.globalData;
    if (user.teams.some(t => t === invitedTeam)) {
      wx.showToast({
        title: '你已经在该团队了',
        icon: 'success',
        duration: 2000,
      });
    } else {
      user.teams.push(invitedTeam);
      await Promise.all([
        db.collection('users').doc(user._id).update({
          data: {
            teams: user.teams,
          },
        }),
        db.collection('teams').doc(invitedTeam).update({
          data: {
            member_ids: _.push(user._id),
          },
        }),
      ]);

      const teamQueryResult = await db.collection('teams').where({
        _id: _.in(user.teams),
      }).get();
      this.setData({
        myTeams: teamQueryResult.data,
      });
      wx.showToast({
        title: '加入成功',
        icon: 'success',
        duration: 2000,
      });
    }
  },
  loadData: async function () {
    const { invitedTeam } = this.data;
    invitedTeam && await this.addUserToTeam(invitedTeam);
    const { user } = app.globalData;
    const myTeams = await this.queryByIds('teams', user.teams);
    let users;
    let myActivities;
    if (myTeams.length > 0) {
      const activityIds = [];
      const userIds = [];
      myTeams.forEach(team => {
        activityIds.push(...team.activity_ids);
        userIds.push(...team.member_ids);
      });
      myTeams.sort((a, b) => (user.teams.indexOf(a._id) - user.teams.indexOf(b._id)));
      if (userIds.length > 0) {
        users = await this.queryByIds('users', userIds);
      }
      if (activityIds.length > 0) {
        const activities = await this.queryByIds('activities', activityIds);
        activities.forEach(activity => {
          activity.onDutyUser = this.findById(users, activity.on_duty_user);
          activity.participators = activity.participators.map(member => (this.findById(users, member)));
        });

        myTeams.forEach(team => {
          team.activities = team.activity_ids.map(id => (this.findById(activities, id)));
          team.members = team.member_ids.map(id => (this.findById(users, id)));
        });

        myActivities = activities.filter(activity => (activity.onDutyUser._id === user._id));
      }

      this.setData({
        myTeams,
        myActivities,
        users,
      });
    }
    this.setData({
      hasUserInfo: true,
      loading: false,
    });
  },
  queryByIds: async function (collectionName, ids) {
    const queryResult = await db.collection(collectionName).where({
      _id: _.in(ids),
    }).get();
    return queryResult.data;
  },
  findById: function (collection, id) {
    return collection.find(i => i._id === id) || {};
  },
});
