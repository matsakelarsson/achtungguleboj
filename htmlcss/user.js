var vm = new Vue({
  el: '#main',
  data: {
    info: [],

  },
  methods: {
    addToInfo: function() {
      var origin = document.getElementById('origin').value;
      var dest = document.getElementById('dest').value;
      this.info.push(origin);
      this.info.push(dest);
      console.log(this.info);
      this.save();

    },
    print: function() {
      console.log(info);

    },
    save: function() {
      var save = this.info;
      localStorage.setItem("saved", save);

    },

    retrieve: function() {
      var saved = localStorage.getItem("saved");
      this.info = saved;
      console.log(this.info);

    },


  }

})
