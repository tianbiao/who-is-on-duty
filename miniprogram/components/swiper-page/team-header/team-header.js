Component({
  options: {
    styleIsolation: 'apply-shared',
  },
  properties: {
    team: Object,
    _id: String,
    name: String,
    activities: Array,
    managers: Array,
    members: Array,
  },
  lifetimes: {
    attached: function () {
      const { _id, name, activities, managers, members, team } = this.data;
      if (team) {
        this.setData({
          _id: _id || team._id,
          name: name || team.name,
          activities: activities.length > 0 ? activities : team.activities,
          managers: managers.length > 0 ? managers : team.managers,
          members: members.length > 0 ? members : team.members,
        });
      }
    },
  },
  methods: {
    triggerSettings: function () {
      const { _id, name, activities, managers, members } = this.data;
      this.triggerEvent('settings', { _id, name, activities, managers, members });
    },
    triggerFavor: function () {
      const { _id } = this.data;
      this.triggerEvent('favor', { _id });
    },
  },
});
