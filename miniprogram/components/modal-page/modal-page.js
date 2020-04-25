// components/modal-page/modal-page.js
Component({
  options: {
    styleIsolation: 'apply-shared',
  },
  properties: {
    modal: Object,
  },
  data: {
    direction: '',
    disableSave: true,
  },
  lifetimes: {
    attached: function () {
      this.setData({
        disableSave: true,
      });
    },
  },
  observers: {
    'modal.type': function () {
      const { modal: { type } } = this.data;
      let direction = 'bottom';
      if (type === 'team') {
        direction = 'top';
      } else if (type === 'user') {
        direction = '';
      }
      this.setData({
        direction,
      });
    },
  },
  methods: {
    triggerClose: function () {
      this.triggerEvent('close', {});
    },
    triggerSave: function () {
      this.triggerEvent('save', this.data.modal.data);
    },
    toggleSave: function (event) {
      console.log(event);
      this.setData({
        disableSave: event.detail.disableSave,
      });
    },
  },
});
