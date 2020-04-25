const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Component({

  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    hasUser: false,
    name: '',
    loading: true,
    disabledSaveBtn: true
  },

  lifetimes: {
    attached() {
      console.log('Invoke login')
      this.getUserOpenId()
    }
  },

  methods: {
    async getUserOpenId() {
      const result = await wx.cloud.callFunction({
        name: 'getOpenId'
      })
      app.globalData.userOpenId = result.result.openid

      const userData = await this.findUserByOpenId()
      if(userData.length == 0){
        this.setData({
          hasUser: false,
          loading: false
        });
      } else {
        app.globalData.user = userData[0]
        console.log('app.globalData.user: ', app.globalData.user )
        this.setData({
          hasUser: true,
          loading: false
        });
        await this.loadData()
      }
    },
    async findUserByOpenId(openId) {
      const userQueryResult = await db.collection('users').where({
        _openid: app.globalData.userOpenId
      }).get()
      return userQueryResult.data
    },
    changeName(e) {
      this.setData({
        name: e.detail.value,
        disabledSaveBtn: e.detail.value.length < 3
      })
    },
    async createUser() {
      console.log('createUser:', this.data.name)
      const addUserResult = await db.collection('users').add({
        data: {
          name: this.data.name,
          teams: []
        }
      })
      app.globalData.user = {
        _id: addUserResult._id,
        _openid: app.globalData.userOpenId,
        name: this.data.name,
        teams: []
      }
      await this.loadData()
    },
    async loadData() {
      const teamQueryResult = await db.collection('teams')
      .where({
        _id: _.in(app.globalData.user.teams)
      }).get()
      const ondutyData = teamQueryResult.data
      app.globalData.ondutyData = ondutyData;
      this.triggerEvent("load")
    }
  }

})
