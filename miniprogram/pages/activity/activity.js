const db = wx.cloud.database()
const app = getApp()

Page({
  data: {
    team: '',
    activity: '',
    participators: [],
    index: 0,
    disabled: true
  },
  onLoad: function (options) {
    const team = app.globalData.ondutyData.find(t => t.name === options.team)
    const activity = team.activities.find(a => a.name === options.activity)
    this.setData({
      team: team,
      activity: activity,
      participators: activity.participators,
      index: activity.participators.findIndex(e => e === activity.onDutyUser)
    })
    console.log('333:', this.data.team)
  },
  changeOnDutyUser: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
    if(this.data.participators[this.data.index] != this.data.activity.onDutyUser){
      this.setData({
        disabled: false
      })
    }
  },
  save: function() {
    const activities = this.data.team.activities.map(a => {
      if(a.name == this.data.activity.name) {
        a.onDutyUser = this.data.participators[this.data.index]
      }
      return a
    })
    console.log('save activities: ', activities)
    db.collection('teams').doc(this.data.team._id).update({
      data: {
        activities: activities
      },
      success: function(res) {
        wx.navigateTo({
          url: '../index/index'
        })
      }
    })
  },
})