const db = wx.cloud.database()
const app = getApp()

Page({
  data: {
    team: '',
    activity: '',
    participators: [],
    teamMembers: [],
    index: 0,
    disabled: true,
    bgSize: {},
    flexWrapFix: true,
    bgimgList: [
      'https://goss1.veer.com/creative/vcg/veer/612/veer-310544626.jpg',
      'https://goss1.veer.com/creative/vcg/veer/612/veer-309964695.jpg',
      'https://goss.veer.com/creative/vcg/veer/612/veer-167598354.jpg',
      'https://goss1.veer.com/creative/vcg/veer/612/veer-153462540.jpg',
      'https://goss4.veer.com/creative/vcg/veer/612/veer-158618183.jpg',
    ]
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
    this.styleAdjustment();
  },
  changeOnDutyUser: function(e) {
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
  styleAdjustment: function () {
    const query = wx.createSelectorQuery();
    query.select('.team-members').boundingClientRect();
    query.selectAll('.team-member').boundingClientRect();
    query.select('#flex-wrap-fix').boundingClientRect();
    query.exec(([containerBounding, memberBounding, flexWrapFix]) => {
      flexWrapFix = flexWrapFix.left > memberBounding[0].left;
      const offset = (containerBounding.width * 1.15 - containerBounding.height) / 2;
      this.setData({
        flexWrapFix,
        bgSize: `${containerBounding.width}px`,
        teamMembers: this.data.teamMembers.map(
          (member, idx) => ({
            ...member,
            x: containerBounding.left - memberBounding[idx].left,
            y: containerBounding.top - memberBounding[idx].top - offset,
          })),
      });
    });
  },
})
