const app = getApp();
const db = wx.cloud.database();
const _ = db.command;

Component({
  options: {
    styleIsolation: 'apply-shared',
  },
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
    getUserOpenId: async function () {
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
        this.triggerEvent('load');
      }
    },
    findUserByOpenId: async function () {
      const userQueryResult = await db.collection('users').where({
        _openid: app.globalData.userOpenId,
      }).get();
      return userQueryResult.data;
    },
    changeName(event) {
      this.setData({
        name: event.detail.value,
        disabledSaveBtn: event.detail.value.length < this.data.minNameLength,
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
      this.triggerEvent('load');
    },
  },
});
