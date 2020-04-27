const app = getApp();
const db = wx.cloud.database();
const _ = db.command;

Component({

  properties: {},
  data: {
    hasUser: false,
    name: '',
    loading: true,
    disabledSaveBtn: true,
    minNameLength: 2,
    maxNameLength: 20,
  },

  lifetimes: {
    attached() {
      console.log('Invoke login');
      this.getUserOpenId();
    },
  },

  methods: {
    async getUserOpenId() {
      const result = await wx.cloud.callFunction({
        name: 'getOpenId',
      });
      app.globalData.userOpenId = result.result.openid;

      const userData = await this.findUserByOpenId();
      if (userData.length === 0) {
        this.setData({
          hasUser: false,
          loading: false,
        });
      } else {
        app.globalData.user = userData[0];
        await this.loadData();
      }
    },
    async findUserByOpenId(openId) {
      const userQueryResult = await db.collection('users').where({
        _openid: app.globalData.userOpenId,
      }).get();
      return userQueryResult.data;
    },
    changeName(e) {
      this.setData({
        name: e.detail.value,
        disabledSaveBtn: e.detail.value.length < this.data.minNameLength,
      });
    },
    async createUser() {
      console.log('createUser:', this.data.name);
      const addUserResult = await db.collection('users').add({
        data: {
          name: this.data.name,
          teams: [],
        },
      });
      app.globalData.user = {
        _id: addUserResult._id,
        _openid: app.globalData.userOpenId,
        name: this.data.name,
        teams: [],
      };
      await this.loadData();
    },
    async loadData() {
      const teams = await this.queryByIds('teams', app.globalData.user.teams);
      if (teams.length > 0) {
        let activityIds = [];
        let userIds = [];
        teams.forEach(team => {
          activityIds = activityIds.concat(team.activity_ids);
          userIds = userIds.concat(team.member_ids);
        });

        if (userIds.length > 0) {
          const users = await this.queryByIds('users', userIds);
          app.globalData.users = users;
        }

        if (activityIds.length > 0) {
          const activities = await this.queryByIds('activities', activityIds);
          activities.forEach(a => {
            a.on_duty_user = this.findUserById(a.on_duty_user);
            for (const index in a.participators) {
              a.participators[index] = this.findUserById(a.participators[index]);
            }
          });
          app.globalData.activities = activities;
        }

        teams.forEach(team => {
          team.activities = [];
          team.members = [];

          for (const index in team.activity_ids) {
            team.activities[index] = this.findActivityById(team.activity_ids[index]);
          }
          for (const index in team.member_ids) {
            team.members[index] = this.findUserById(team.member_ids[index]);
          }
        });
      }
      app.globalData.teams = teams;
      this.triggerEvent('load');
      this.setData({
        loading: false,
      });
    },
    async queryByIds(collectionName, ids) {
      const queryResult = await db.collection(collectionName).where({
        _id: _.in(ids),
      }).get();
      return queryResult.data;
    },
    findUserById(id) {
      return app.globalData.users.find(u => u._id === id) || {};
    },
    findActivityById(id) {
      return app.globalData.activities.find(u => u._id === id) || {};
    },
  },

});
