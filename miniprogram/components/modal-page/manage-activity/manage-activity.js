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
    disableSave: true,
  },
  lifetimes: {
    attached: function () {
      const { activity, bgimgList } = this.data;
      console.log(activity);
      this.setData({
        disableSave: true,
        name: activity.name,
        desc: activity.desc,
        onDutyUser: activity.onDutyUser,
        onDutyIdx: activity.participators.indexOf(activity.onDutyUser),
        bgimg: activity.bgimg,
        bgimgIdx: bgimgList.indexOf(activity.bgimg),
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
  observers: {
    'name, desc, onDutyUser, participators, bgimg': function (name, desc, onDutyUser, participators, bgimg) {
      const { activity } = this.data;
      if (
        name !== activity.name
        || desc !== activity.desc
        || onDutyUser !== activity.onDutyUser
        || participators !== activity.participators
        || bgimg !== activity.bgimg
      ) {
        this.setData({ disableSave: participators.length === 0 });
      } else {
        this.setData({ disableSave: true });
      }
    },
  },
  methods: {
    changeName: function (event) {
      this.setData({
        name: event.detail.value,
      });
    },
    changeDesc: function (event) {
      this.setData({
        desc: event.detail.value,
      });
    },
    changeOnDutyUser: function (event) {
      const { participators } = this.data;
      this.setData({
        onDutyIdx: event.detail.value,
        onDutyUser: participators[event.detail.value],
      });
    },
    changedParticipators: function (event) {
      const { participators, onDutyIdx } = this.data;
      const currentOnDutyUser = participators[onDutyIdx];
      const currentOnDutyUserIndex = event.detail.value.findIndex(user => user === currentOnDutyUser);
      const participatorsNew = event.detail.value;
      const onDutyIdxNew = currentOnDutyUserIndex < 0 ? 0 : currentOnDutyUserIndex;
      this.setData({
        participators: participatorsNew,
        onDutyIdx: onDutyIdxNew,
        onDutyUser: participatorsNew[onDutyIdxNew],
      });
    },
    changeBgimg: function (event) {
      const { bgimgList } = this.data;
      this.setData({
        bgimgIdx: event.detail.current,
        bgimg: bgimgList[event.detail.current],
      });
    },
    cancel: function () {
      this.triggerEvent('cancel');
    },
    save: function () {
      this.triggerEvent('save', this.data);
    },
  },
});
