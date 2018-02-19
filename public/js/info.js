var vm = new Vue({
  el: '#main',
  data: {
    infoArr: [],
    loopobj: ["Wheelchair", "Babyseat", "Extra", "Assistance"],
    info: null
  },
  methods: {
    addInfo: function () {
      var checkbox = document.getElementsByName('check');
      var length = checkbox.length;
      for (var i = 0; i < length; ++i){
        if (checkbox[i].checked){
          this.infoArr.push(checkbox[i].value);
  }
}
  console.log(this.info);
    }

  },
  saveData: function () {
    sessionStorage.setItem('info', this.infoArr);

  },
  getData: function () {
    var data = sessionStorage.getItem('info');
    this.infoArr.push(data);
    //console.log(this.infoArr);

  }
})
