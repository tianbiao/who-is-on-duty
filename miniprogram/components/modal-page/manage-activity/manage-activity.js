Component({
  options: {
    styleIsolation: 'apply-shared',
  },
  properties: {
    activity: Object,
  },
  data: {
    _id: '',
    teamId: '',
    name: '',
    desc: '',
    onDutyUser: {},
    rotate: '',
    participators: [],
    bgimg: '',
    onDutyIdx: 0,
    bgimgIdx: 0,
    rotateIdx: 0,
    teamMembers: [],
    flexWrapFix: true,
    disableSave: true,
    bgimgList: [
      'https://goss1.veer.com/creative/vcg/veer/612/veer-310544626.jpg',
      'https://goss1.veer.com/creative/vcg/veer/612/veer-309964695.jpg',
      'https://goss.veer.com/creative/vcg/veer/612/veer-167598354.jpg',
      'https://goss1.veer.com/creative/vcg/veer/612/veer-153462540.jpg',
      'https://goss4.veer.com/creative/vcg/veer/612/veer-158618183.jpg',
    ],
    activityRotate: ['每天', '每周', '每月'],
  },
  lifetimes: {
    attached: function () {
      const { activity, bgimgList, activityRotate } = this.data;
      this.setData({
        disableSave: true,
        _id: activity._id || '',
        teamId: activity.teamId,
        name: activity.name || '',
        desc: activity.desc || '',
        onDutyUser: activity.onDutyUser || (activity.participators && activity.participators[0]) || activity.teamMembers[0],
        onDutyIdx: activity.participators
          && activity.participators.findIndex(e => e._id === activity.onDutyUser._id) || 0,
        rotate: activity.rotate || '每天',
        rotateIdx: activityRotate.indexOf(activity.rotate) || 0,
        bgimg: activity.bgimg || bgimgList[0],
        bgimgIdx: activity.bgimg ? bgimgList.indexOf(activity.bgimg) : 0,
        participators: activity.participators || activity.teamMembers,
        teamMembers: activity.teamMembers.map(user => ({
          ...user,
          isParticipator: activity.participators ? activity.participators.some(u => user._id === u._id) : true,
        })),
      });
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
    'name, desc, onDutyUser, participators, bgimg, rotate': function (
      name, desc, onDutyUser, participators, bgimg, rotate) {
      const { activity } = this.data;
      if (
        name !== activity.name
        || desc !== activity.desc
        || onDutyUser !== activity.onDutyUser
        || participators !== activity.participators
        || bgimg !== activity.bgimg
        || rotate !== activity.rotate
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
    changeRotate(event) {
      const { activityRotate } = this.data;
      this.setData({
        rotateIdx: event.detail.value,
        rotate: activityRotate[event.detail.value],
      });
    },
    changedParticipators: function (event) {
      const { teamMembers, onDutyUser } = this.data;
      const currentOnDutyUserIndex = event.detail.value.findIndex(user => user === onDutyUser._id);
      const participatorsNew = teamMembers.filter(member => (event.detail.value.includes(member._id)));
      const onDutyIdxNew = currentOnDutyUserIndex < 0 ? 0 : currentOnDutyUserIndex;
      this.setData({
        participators: participatorsNew,
        onDutyIdx: onDutyIdxNew,
        onDutyUser: participatorsNew.length > 0 && participatorsNew[onDutyIdxNew],
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
      const {
        _id,
        teamId,
        name,
        desc,
        onDutyUser,
        rotate,
        participators,
        bgimg,
      } = this.data;
      this.triggerEvent('save', {
        type: 'activity', data: {
          _id,
          teamId,
          name,
          desc,
          onDutyUser,
          rotate,
          participators,
          bgimg,
        },
      });
    },
  },
});
