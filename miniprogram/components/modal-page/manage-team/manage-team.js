Component({
  options: {
    styleIsolation: 'apply-shared',
  },
  properties: {
    team: Object,
  },
  data: {
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
        disableSave: true,
        name: team.name,
        members: team.members,
      });
    },
    ready: function () {
      const query = wx.createSelectorQuery().in(this);
      query.select('.team-members').boundingClientRect();
      query.selectAll('.team-member').boundingClientRect();
      query.select('#flex-wrap-fix').boundingClientRect();
      query.exec(([containerBounding, memberBounding, flexWrapFix]) => {
        flexWrapFix = flexWrapFix.left > memberBounding[0].left;
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
    invite: function () {
      const { name, team: { _id } } = this.data;
      this.triggerEvent('invite', { name, _id });
    },
    cancel: function () {
      this.triggerEvent('cancel');
    },
    save: function () {
      this.triggerEvent('save', { type: 'team', data: this.data });
    },
    createActivity: function () {
      const { members } = this.data;
      this.triggerEvent('activity', { teamMembers: members });
    },
  },
});
