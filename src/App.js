import React, { Component } from 'react';
import './App.css';
import xhr from 'xhr';
const distance = require('turf-distance');

class App extends Component {

  state = {
    location: {
      lat: undefined,
      lng: undefined
    },
    hurricane_info: {
      center: {
        lat: undefined,
        lng: undefined
      },
      maxwind: undefined,
      gusts: undefined,
      tcdvlp: undefined
    },
    geolocation_supported: undefined,
    distance: undefined,
    hurricane_name: 'Matthew'
  };

  getLocation = () => {
    if (navigator.geolocation) {
      this.state.geolocation_supported = true;
      navigator.geolocation.getCurrentPosition(this.showLocation);
    } else {
      this.state.geolocation_supported = false;
    }
  }

  showLocation = (pos) => {
    this.setState({
      location: {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      }
    });
    this.getHurricaneInfo();
  }

  getHurricaneInfo = () => {
    var url = `https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/wwa_meteocean_tropicalcyclones_trackintensityfcsts_time/MapServer/3/query?where=stormname+%3D+%27MATTHEW%27&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=4236&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&f=json`;
    xhr({
      url: url
    }, (err, data) => {
      var resp = JSON.parse(data.body);
      this.setState({
        hurricane_info: {
        center: {
          lat: resp.features[0].geometry.y,
          lng: resp.features[0].geometry.x
        },
          maxwind: resp.features[0].attributes.maxwind,
          gusts: resp.features[0].attributes.gust,
          tcdvlp: resp.features[0].attributes.tcdvlp
        }
      });
      this.calculateDistance();
    });
  }

  calculateDistance = () => {
    var point1 = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Point",
        "coordinates": [this.state.location.lng, this.state.location.lat]
      }
    };
    var point2 = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Point",
        "coordinates": [this.state.hurricane_info.center.lng, this.state.hurricane_info.center.lat]
      }
    };

    var units = 'miles';

    var d = distance(point1, point2, units);
    this.setState({
      distance: Math.ceil(d)
    })
  }

  componentDidMount = () => {
    this.getLocation();
  }

  render() {
    return (
      <div className="App">
        <h1>{this.state.distance ? this.state.distance : 'loading'}</h1>
        <h2>Miles</h2>
        <p>Your Location ({this.state.location.lat}, {this.state.location.lng}) is {this.state.distance ? this.state.distance : '...'} miles from Hurricane {this.state.hurricane_name}</p>
        <p className='secondary'>Max Wind: {this.state.hurricane_info.maxwind}, Gusts: {this.state.hurricane_info.gusts}, Status: {this.state.hurricane_info.tcdvlp} </p>
      </div>
    );
  }
}

export default App;
