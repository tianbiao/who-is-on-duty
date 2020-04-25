Component({
  options: {
    styleIsolation: 'apply-shared',
  },
  properties: {
    team: Object,
    name: String,
    activities: Array,
  },
  lifetimes: {
    attached: function () {
      const { name, activities, team } = this.data;
      if (team) {
        this.setData({
          name: name || team.name,
          activities: activities.lenght > 0 ? activities : team.activities,
        });
      }
    },
  },
  methods: {
    passEvent: function (event) {
      this.triggerEvent(event.type, event.detail);
    },
    manageActivity: function (event) {
      const { team } = this.data;
      this.triggerEvent('activity', {
        ...event.detail,
        teamMembers: team.members,
      });
    },
  },
});
