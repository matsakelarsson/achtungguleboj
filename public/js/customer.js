/*jslint es5:true, indent: 2 */
/*global Vue, io */
/* exported vm */
'use strict';
var socket = io();

var vm = new Vue({
  el: '#main',
  data: {
    orderId: null,
    map: null,
    fromMarker: null,
    destMarker: null,
    taxiMarkers: {},
    indexhtml: true,
    customerhtml: false,
    infohtml: false,
    orderconfhtml: false,
    checkboxArr: [],
    needs: '',
    travelers: 0,
    otherNeeds: false,
    travelShow: false,
  },
  created: function () {
    socket.on('initialize', function (data) {
      // add taxi markers in the map for all taxis
      for (var taxiId in data.taxis) {
        this.taxiMarkers[taxiId] = this.putTaxiMarker(data.taxis[taxiId]);
      }
    }.bind(this));
    socket.on('orderId', function (orderId) {
      this.orderId = orderId;
    }.bind(this));
    socket.on('taxiAdded', function (taxi) {
      this.taxiMarkers[taxi.taxiId] = this.putTaxiMarker(taxi);
    }.bind(this));

    socket.on('taxiMoved', function (taxi) {
      this.taxiMarkers[taxi.taxiId].setLatLng(taxi.latLong);
    }.bind(this));

    socket.on('taxiQuit', function (taxiId) {
      this.map.removeLayer(this.taxiMarkers[taxiId]);
      Vue.delete(this.taxiMarkers, taxiId);
    }.bind(this));

    // These icons are not reactive
    this.taxiIcon = L.icon({
      iconUrl: "img/taxi.png",
      iconSize: [36,36],
      iconAnchor: [18,36],
      popupAnchor: [0,-36]
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
//    this.map.on('click', this.handleClick);

    var searchDestControl = L.esri.Geocoding.geosearch({collapsed:false,expanded:true,allowMultipleResults: false, zoomToResult: false, placeholder: "Destination"}).addTo(this.map);
    var searchFromControl = L.esri.Geocoding.geosearch({collapsed:false,expanded:true,allowMultipleResults: false, zoomToResult: false, placeholder: "From"});
    // listen for the results event and add the result to the map
    searchDestControl.on("results", function(data) {
        this.destMarker = L.marker(data.latlng, {draggable: false}).addTo(this.map);
        this.destMarker.on("drag", this.moveMarker);
        searchFromControl.addTo(this.map);

    }.bind(this));

    // listen for the results event and add the result to the map
    searchFromControl.on("results", function(data) {
        this.fromMarker = L.marker(data.latlng, {icon: this.fromIcon, draggable: false}).addTo(this.map);
        this.fromMarker.on("drag", this.moveMarker);
        this.connectMarkers = L.polyline([this.fromMarker.getLatLng(), this.destMarker.getLatLng()], {color: 'blue'}).addTo(this.map);
    }.bind(this));
  },
  methods: {
    putTaxiMarker: function (taxi) {
      var marker = L.marker(taxi.latLong, {icon: this.taxiIcon}).addTo(this.map);
      marker.bindPopup("Taxi " + taxi.taxiId);
      marker.taxiId = taxi.taxiId;
      return marker;
    },
    orderTaxi: function() {
            this.goToOrderconf();
            socket.emit("orderTaxi", { fromLatLong: [this.fromMarker.getLatLng().lat, this.fromMarker.getLatLng().lng],
                                       destLatLong: [this.destMarker.getLatLng().lat, this.destMarker.getLatLng().lng],
                                       orderItems: { Passengers: this.travelers, Info: this.checkboxArr, Needs: this.needs }
                                     });
    },
    handleClick: function (event) {
      // first click sets destination
      if (this.destMarker === null) {
        this.destMarker = L.marker([event.latlng.lat, event.latlng.lng], {draggable: true}).addTo(this.map);
        this.destMarker.on("drag", this.moveMarker);
      }
      // second click sets pickup location
      else if (this.fromMarker === null) {
        this.fromMarker = L.marker(event.latlng, {icon: this.fromIcon, draggable: true}).addTo(this.map);
        this.fromMarker.on("drag", this.moveMarker);
        this.connectMarkers = L.polyline([this.fromMarker.getLatLng(), this.destMarker.getLatLng()], {color: 'blue'}).addTo(this.map);
      }
    },
    moveMarker: function (event) {
      this.connectMarkers.setLatLngs([this.fromMarker.getLatLng(), this.destMarker.getLatLng()], {color: 'blue'});
      /*socket.emit("moveMarker", { orderId: event.target.orderId,
                                latLong: [event.target.getLatLng().lat, event.target.getLatLng().lng]
                                });
                                */
    },
    goToCustomer: function() {
      this.indexhtml = false;
      this.customerhtml = true;
      this.infohtml = false;
      this.orderconfhtml = false;
      setTimeout(function(){ this.map.invalidateSize()}.bind(this), 100);

    },

    goToInfo: function() {
      this.indexhtml = false;
      this.customerhtml = false;
      this.infohtml = true;
      this.orderconfhtml = false;
      this.showMap = "none";
    },
    goToOrderconf: function() {
      this.indexhtml = false;
      this.customerhtml = false;
      this.infohtml = false;
      this.orderconfhtml = true;

      var checkbox = document.getElementsByName('check');
         var length = checkbox.length;
         for (var i = 0; i < length; ++i){
           if (checkbox[i].checked){
             this.checkboxArr.push(checkbox[i].value);
             //this.infoArr.push(radio[i].value);
           }
         }
         var needs = document.getElementById('otherneeds').value;
         var amountOfTravelers = document.getElementById('travelers').value;
         if (needs != ''){
           this.otherNeeds = true;
         }
         if (amountOfTravelers > 0){
           this.travelShow = true;
         }
         this.needs = needs;
         this.travelers = amountOfTravelers;

         console.log(this.checkboxArr);
    },
    goToIndex: function() {
      this.indexhtml = true;
      this.customerhtml = false;
      this.infohtml = false;
      this.orderconfhtml = false;

    },
    }


});
