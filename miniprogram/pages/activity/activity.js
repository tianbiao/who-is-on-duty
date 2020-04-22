const db = wx.cloud.database()
const app = getApp()

Page({
  data: {
    team: '',
    activity: '',
    participators: [],
    teamMembers: [],
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
      teamMembers: team.members.map(member => ({name: member, isParticipator: activity.participators.includes(member)})),
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
  changedParticipators: function(e) {
    console.log('changedParticipators checkBox:', e.detail.value)
    const currentOnDutyUser = this.data.participators[this.data.index]
    const currentOnDutyUserIndex = e.detail.value.findIndex(user => user === currentOnDutyUser);
    this.setData({
      participators: e.detail.value,
      index: currentOnDutyUserIndex < 0 ? 0 : currentOnDutyUserIndex,
      disabled: e.detail.value.length == 0
    })
  },
  save: function() {
    const activities = this.data.team.activities.map(a => {
      if(a.name == this.data.activity.name) {
        a.onDutyUser = this.data.participators[this.data.index]
        a.participators = this.data.participators
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