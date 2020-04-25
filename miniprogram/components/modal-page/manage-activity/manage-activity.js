Component({
  options: {
    styleIsolation: 'apply-shared',
  },
  properties: {
    activity: Object,
  },
  data: {
    name: '',
    desc: '',
    onDutyUser: '',
    onDutyIdx: 0,
    participators: [],
    bgimg: '',
    bgimgIdx: 0,
    bgimgList: [
      'https://goss1.veer.com/creative/vcg/veer/612/veer-310544626.jpg',
      'https://goss1.veer.com/creative/vcg/veer/612/veer-309964695.jpg',
      'https://goss.veer.com/creative/vcg/veer/612/veer-167598354.jpg',
      'https://goss1.veer.com/creative/vcg/veer/612/veer-153462540.jpg',
      'https://goss4.veer.com/creative/vcg/veer/612/veer-158618183.jpg',
    ],
    teamMembers: [],
    flexWrapFix: true,
  },
  lifetimes: {
    attached: function () {
      const { activity, bgimgList } = this.data;
      console.log(activity);
      this.setData({
        name: activity.name,
        desc: activity.desc,
        onDutyUser: activity.onDutyUser,
        bgimgIdx: bgimgList.indexOf(activity.bgimg),
        onDutyIdx: activity.participators.indexOf(activity.onDutyUser),
        participators: activity.participators,
        teamMembers: activity.teamMembers.map(name => ({
          name,
          isParticipator: activity.participators.includes(name),
        })),
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
          teamMembers: this.data.teamMembers.map(
            (member, idx) => ({
              ...member,
              x: containerBounding.left - memberBounding[idx].left,
              y: containerBounding.top - memberBounding[idx].top - offset,
            })),
        });
      });
    },
  },
  observer: {
    // 'participators': function () {
    //   this.setData({
    //
    //   })
    // }
  },
  methods: {
    changeOnDutyUser: function (event) {
      const { participators, activity: { onDutyUser }, onDutyIdx } = this.data;
      this.setData({
        onDutyIdx: event.detail.value,
      });
      if (participators[onDutyIdx] !== onDutyUser) {
        this.triggerEvent('toggleSave', { disableSave: false });
      }
    },
    changedParticipators: function (event) {
      const { participators, onDutyIdx } = this.data;
      const currentOnDutyUser = participators[onDutyIdx];
      const currentOnDutyUserIndex = event.detail.value.findIndex(user => user === currentOnDutyUser);
      this.setData({
        participators: event.detail.value,
        onDutyIdx: currentOnDutyUserIndex < 0 ? 0 : currentOnDutyUserIndex,
      });
      this.triggerEvent('toggleSave', { disableSave: event.detail.value.length === 0 });
    },
  },
});
