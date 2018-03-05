/*jslint es5:true, indent: 2 */
/*global Vue, io */
/* exported vm */
'use strict';
var socket = io();

var vm = new Vue({
  el: '#main',
  data: {
    map: null,
    taxiId: 0,
    taxiLocation: null,
    orders: {},
    taxis: {},
    customerMarkers: {},
    driverhtml: false,
    ordershtml: false,
    taxiInfohtml: true,
    checkboxArr: [],
    spaces: 0,
    lat: 59.8415,
    long: 17.648,
    pause: false,
  },
  created: function () {
    socket.on('initialize', function (data) {
      this.orders = data.orders;
    }.bind(this));
    socket.on('currentQueue', function (data) {
      this.orders = data.orders;
    }.bind(this));
    // this icon is not reactive
    this.taxiIcon = L.icon({
      iconUrl: "img/taxi.png",
      iconSize: [36,36],
      iconAnchor: [18,36]
    });
    this.fromIcon = L.icon({
      iconUrl: "img/customer.png",
      iconSize: [36,50],
      iconAnchor: [19,50]
    });

  },
  mounted: function () {
    // set up the map
    this.map = L.map('my-map').setView([59.8415,17.648], 13);

    // create the tile layer with correct attribution
    var osmUrl='http://{s}.tile.osm.org/{z}/{x}/{y}.png';
    var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
    L.tileLayer(osmUrl, {
        attribution: osmAttrib,
        maxZoom: 18
    }).addTo(this.map);
   this.map.on('click', this.setTaxiLocation);
   console.log(this.lat, this.long);

  },
  beforeDestroy: function () {
    socket.emit('taxiQuit', this.taxiId);
  },
  methods: {
    setTaxiLocation: function (event) {

      if (this.taxiLocation === null) {
        this.taxiLocation = L.marker([this.lat, this.long], {icon: this.taxiIcon, draggable: true}).addTo(this.map);
        this.taxiLocation.on("drag", this.moveTaxi);
        socket.emit("addTaxi", { taxiId: this.taxiId,
                                latLong: [this.lat, this.long],
                                taxiItems: { Passengers: this.spaces, Info: this.checkboxArr }
                                });
      }
      else {
        this.taxiLocation.setLatLng(event.latlng);
        this.moveTaxi(event);
         console.log(this.lat, this.long);
      }
    },
    moveTaxi: function (event) {
      socket.emit("moveTaxi", { taxiId: this.taxiId,
                                latLong: [event.latlng.lat, event.latlng.lng]
                                });
    },
    quit: function () {
      this.map.removeLayer(this.taxiLocation);
      this.taxiLocation = null;
      socket.emit("taxiQuit", this.taxiId);
    },
    acceptOrder: function (order) {
        this.customerMarkers = this.putCustomerMarkers(order);
        order.taxiIdConfirmed = this.taxiId;
        socket.emit("orderAccepted", order);
    },
    finishOrder: function (orderId) {
      Vue.delete(this.orders, orderId);
      this.map.removeLayer(this.customerMarkers.from);
      this.map.removeLayer(this.customerMarkers.dest);
      this.map.removeLayer(this.customerMarkers.line);
      Vue.delete(this.customerMarkers);
      socket.emit("finishOrder", orderId);
    },
    putCustomerMarkers: function (order) {
      var fromMarker = L.marker(order.fromLatLong, {icon: this.fromIcon}).addTo(this.map);
      fromMarker.orderId = order.orderId;
      var destMarker = L.marker(order.destLatLong).addTo(this.map);
      destMarker.orderId = order.orderId;
      var connectMarkers = L.polyline([order.fromLatLong, order.destLatLong], {color: 'blue'}).addTo(this.map);
      return {from: fromMarker, dest: destMarker, line: connectMarkers};
    },
	 goToOrders: function() {
		this.driverhtml = false;
		this.ordershtml = true;
    this.taxiInfohtml = false;
	 },
	 goToDriver: function() {
		this.driverhtml = true;
		this.ordershtml = false;
    this.taxiInfohtml = false;
    setTimeout(function(){ this.map.invalidateSize()}.bind(this), 100);
	 },
	 addElem: function() {
		var ul = document.getElementById("list");
		var li = document.createElement("li");
		//this.orders[this.pause] = document.createTextNode("Pause");
    this.pause = true;
		//ul.appendChild(li);
  },
   createTaxi: function() {
      var checkbox = document.getElementsByName('check');
         var length = checkbox.length;
         for (var i = 0; i < length; ++i){
           if (checkbox[i].checked){
             this.checkboxArr[i]=checkbox[i].value;
             //this.checkboxArr.push(checkbox[i].value);
             //this.infoArr.push(radio[i].value);
           }
           else {
             this.checkboxArr[i]=null;
           }
         }
         var taxiId = document.getElementById('IDs').value;
         var amountOfSpaces = document.getElementById('spaces').value;
         if (taxiId != ''){
           this.IDs = true;
         }
         if (amountOfSpaces > 0){
           this.travelShow = true;
         }
         this.taxiId = taxiId;
         this.spaces = amountOfSpaces;

         console.log(this.checkboxArr);
         console.log(this.spaces);
         console.log(this.taxiId);
         this.setTaxiLocation();

    },
    handler: function() {
      this.createTaxi();
      this.goToDriver();

    }

  }
});
