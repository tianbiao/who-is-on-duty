const app = getApp();

Component({
  options: {
    styleIsolation: 'apply-shared',
  },
  properties: {
    team: Object,
  },
  data: {
    _id: '',
    name: '',
    members: [],
    disableSave: true,
  },
  observers: {
    'name': function (name) {
      const { team } = this.data;
      if (
        name !== team.name
      ) {
        this.setData({ disableSave: false });
      } else {
        this.setData({ disableSave: true });
      }
    },
  },
  lifetimes: {
    attached: function () {
      const { team } = this.data;
      this.setData({
        _id: team._id,
        disableSave: true,
        name: team.name,
        members: team.members,
      });
      app.globalData.invitedTeamName = team.name;
      app.globalData.invitedTeamId = team._id;
    },
    ready: function () {
      const query = wx.createSelectorQuery().in(this);
      query.select('.team-members').boundingClientRect();
      query.selectAll('.team-member').boundingClientRect();
      query.select('#flex-wrap-fix').boundingClientRect();
      query.exec(([containerBounding, memberBounding, flexWrapFix]) => {
        flexWrapFix = memberBounding.length > 0 && flexWrapFix.left > memberBounding[0].left;
        const offset = (containerBounding.width * 1.15 - containerBounding.height) / 2;
        this.setData({
          flexWrapFix,
          bgSize: `${containerBounding.width}px`,
          members: this.data.members.map(
            (member, idx) => ({
              ...member,
              x: containerBounding.left - memberBounding[idx].left,
              y: containerBounding.top - memberBounding[idx].top - offset,
            })),
        });
      });
    },
  },
  methods: {
    changeName: function (event) {
      this.setData({
        name: event.detail.value,
      });
    },
    cancel: function () {
      this.triggerEvent('cancel');
    },
    save: function () {
      this.triggerEvent('save', { type: 'team', data: this.data });
    },
    createActivity: function () {
      const { members, _id } = this.data;
      this.triggerEvent('activity', { teamId: _id, teamMembers: members });
    },
  },
});
