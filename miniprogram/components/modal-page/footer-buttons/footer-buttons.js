Component({
  options: {
    styleIsolation: 'apply-shared',
  },
  properties: {
    disableSave: Boolean,
  },
  methods: {
    triggerCancel: function () {
      this.triggerEvent('cancel');
    },
    triggerSave: function () {
      this.triggerEvent('save');
    },
  },
});
