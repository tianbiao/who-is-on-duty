const db = wx.cloud.database()
const app = getApp()
const _ = db.command

Page({
  data: {
    team: {},
    teamid: '',
    hasUserInfo: false,
    isTeamManager: false,
    isFromShare: false,
    shareResultMessage: ''
  },

  onLoad: function (options) {
    this.setData({
      teamid: options.teamid
    })
    if (options.fromShare){
      this.setData({
        isFromShare: true
      })
    }
    this.loadData() 
  },
  loadData() {
    if(app.globalData.teams){
      const team = app.globalData.teams.find(t => t._id === this.data.teamid)
      if(team){
        this.setData({
          team: team,
          hasUserInfo: true,
          shareResultMessage: '你已经在此团队了',
          isTeamManager: team.managers.includes(app.globalData.user._id)
        })
      } else {
        this.addUserToTeam()
      }
    }
  },
  async addUserToTeam() {
    app.globalData.user.teams.push(this.data.teamid)
    await db.collection('users').doc(app.globalData.user._id).update({
      data: {
        teams: app.globalData.user.teams
      }
    })
    await db.collection('teams').doc(this.data.teamid).update({
      data: {
        members: _.push(app.globalData.user._id)
      }
    })

    const teamQueryResult = await db.collection('teams')
      .where({
        _id: _.in(app.globalData.user.teams)
      }).get()
    const ondutyData = teamQueryResult.data
    app.globalData.teams = ondutyData
    const team = ondutyData.find(t => t._id === this.data.teamid)
    this.setData({
      team: team,
      hasUserInfo: true,
      shareResultMessage: '恭喜你已成功加入此团队',
      isTeamManager: team.managers.includes(app.globalData.user._id)
    })
  },
  addTeamMember() {
    this.onShareAppMessage()
  },
  onShareAppMessage() {
    const userName = app.globalData.user.name
    return {
      title: userName + '邀请你加入: ' + this.data.team.name,
      path: 'pages/team/team?fromShare=true&teamid=' + this.data.team._id,
      //imageUrl: '',
      success() {
        wx.showShareMenu({
          withShareTicket: true
        })
      }
    }
  }
})