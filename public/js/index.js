var vm = new Vue({
  el: '#main',
  data: {
    indexhtml: true,
    customerhtml: false,
    infohtml: false,
    orderconfhtml: false,

  },
  methods: {
    goToCustomer: function() {
      this.indexhtml = false;
      this.customerhtml = true;
      this.infohtml = false;
      this.orderconfhtml = false;

    },
    
    goToInfo: function() {
      this.indexhtml = false;
      this.customerhtml = false;
      this.infohtml = true;
      this.orderconfhtml = false;
    },
    goToOrderconf: function() {
      this.indexhtml = false;
      this.customerhtml = false;
      this.infohtml = false;
      this.orderconfhtml = true;

    },
    goToIndex: function() {
      this.indexhtml = true;
      this.customerhtml = false;
      this.infohtml = false;
      this.orderconfhtml = false;

    },

  }



})
