// components/modal-page/modal-page.js
Component({
  options: {
    styleIsolation: 'apply-shared',
  },
  properties: {
    modal: Object,
  },
  methods: {
    passEvent: function (event) {
      this.triggerEvent(event.type, event.detail);
    },
  },
});
