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
    passEvent: function (event) {
      this.triggerEvent(event.type, event.detail);
    },
  },
});
