Component({
  options: {
    styleIsolation: 'apply-shared',
  },
  properties: {
    activity: Object,
    noMargin: Boolean,
    _id: String,
    name: String,
    desc: String,
    onDutyUser: Object,
    bgimg: String,
    participators: Array,
  },
  lifetimes: {
    attached: function () {
      const { _id, name, desc, on_duty_user, bgimg, participators, activity } = this.data;
      if (activity) {
        this.setData({
          _id: _id || activity._id,
          name: name || activity.name,
          desc: desc || activity.desc,
          onDutyUser: on_duty_user || activity.on_duty_user,
          bgimg: bgimg || activity.bgimg,
          participators: participators.length > 0 ? participators : activity.participators,
        });
      }
    },
  },
  methods: {
    triggerActivity: function () {
      this.triggerEvent('activity', this.data);
    },
  },
});
