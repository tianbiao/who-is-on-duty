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
          activities: activities || team.activities || [],
          managers: managers || team.managers,
          members: members || team.members,
        });
      }
    },
  },
  methods: {
    triggerSettings: function () {
      this.triggerEvent('settings', this.data);
    },
    triggerFavor: function () {
      this.triggerEvent('favor', this.data);
    },
  },
});
