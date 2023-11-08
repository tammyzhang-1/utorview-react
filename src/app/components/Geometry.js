'use client'
import proj4 from 'proj4';
import * as d3 from 'd3';
import Plots from './Plots.js'
import { useMemo } from 'react';


// predefined resolution settings
let wofs_x_length = 300;
let wofs_y_length = 300;
let resolution = 3000;
let radius = resolution / 2;

// reprojecting the data coordinates
let orig_proj = "WGS84";
let base_proj = "+proj=lcc +lat_0=34.321392 +lon_0=-98.0134 +lat_1=30 +lat_2=60 +a=6370000 +b=6370000 +ellps=WGS84";
let base_transformer = proj4(base_proj, orig_proj);

export default function Geometry({msg_file_len, selectedModelRun, selectedEnsemble, selectedForecast, json, reflectivityData, opacity}) {
  console.log("-----------------RENDER OCCURRED! Geometry")

  let base_coord = base_transformer.inverse(json['fm_' + selectedForecast]['se_coords']);
  let wofs_proj = derive_new_proj(base_transformer, base_coord);
  let transformer = proj4(wofs_proj, orig_proj);
  let coord = transformer.inverse(json['fm_' + selectedForecast]['se_coords']);

  // const plot_d = useMemo(() => {
  //   console.log(selectedEnsemble)
  //   console.log("PLOT_D JUST LOADED")
  //   return build_data_object(transformer,selectedEnsemble,0,msg_file_len,json)
  //   }, 
  //   [selectedEnsemble])
  let plot_d = build_data_object(transformer,selectedEnsemble,0,msg_file_len,json)

  // console.log(reflectivityData)
  // const plot_r = useMemo(() => {
  //   if (reflectivityData) {
  //     console.log("PLOT_R JUST LOADED")
  //     return build_data_object(transformer,selectedEnsemble,0, msg_file_len, reflectivityData)
  //   } else {
  //     console.log("PLOT_R NOT LOAED")
  //     return {};
  //   }},
  //   [selectedEnsemble])


  let spaghetti_traces = [];
  let cell_i, cell_j;

  // let plot_d = {};
  // run a function that creates FeatureCollection for each timestamp of json and saves these to plot_d
  // build_data_object(transformer,selectedEnsemble,0,msg_file_len,json);

  let plot_r = {}
  if (reflectivityData) {
    plot_r = build_data_object(transformer,selectedEnsemble,0, msg_file_len, reflectivityData, plot_r)
  }

  // more grid info describing the data
  let total_grid_cells = json['fm_' + selectedForecast]['MEM_' + selectedEnsemble]['rows'].length;
  let lon_array_m = create_coord_array(coord[0], wofs_x_length, resolution);
  let lat_array_m = create_coord_array(coord[1], wofs_y_length, resolution);
  let domain = get_wofs_domain_geom(transformer, lon_array_m, lat_array_m);

  let plot_data = plot_d[selectedForecast + '_' + selectedEnsemble];
  let plot_geom = plot_data[0];
  let plot_coords = plot_data[1];

  let refl_data, total_grid_cells_r, plot_geom_r, plot_coords_r;

  // mapbox token for basemap
// let config = {mapboxAccessToken: "pk.eyJ1IjoiYnBldHprZSIsImEiOiJjbGtsY2I1cTAwNnR1M21wY3kxZnk3NG0xIn0.VBcAZDXsltnUxPWsj6TJPA"};

  // get list of forecast date/times at an interval of 5 mins
  let fcst_dates = get_fcst_date_range(selectedModelRun,5);

  // dictionary of custom data layer information
  let map_data = {
    type: "choroplethmapbox",
    locations: d3.range(total_grid_cells), // length of data (number of rows)
    marker: {
      line: {width: 0},
      opacity: 0.7
    },
    z: json['fm_' + selectedForecast]['MEM_' + selectedEnsemble]['values'], // for use in the hover tooltip
    zmin: 0, zmax: 0.75,
    colorbar: {x: -0.12, thickness: 20},
    hoverinfo: "z",
    customdata: plot_coords, 
    colorscale: 'YlGnBu',
    geojson: plot_geom
  }; // referring to FeatureCollection generated from the data

  // creates a new array with all sub-array elements concatenated into it recursively up to the specified depth.
  let all_traces = [map_data].flat();

  if (reflectivityData) {
    let trace_r = select_trace(reflectivityData, plot_r, selectedForecast, selectedEnsemble)
    plot_geom_r = trace_r[1][0]
    plot_coords_r = trace_r[1][1]
    let trace_values_r = trace_r[0]
    total_grid_cells_r = trace_values_r['rows'].length

    let refl_alpha = opacity/100;

    refl_data = {
      type: "choroplethmapbox",
      locations: d3.range(total_grid_cells_r),
      marker: {
        line: {width: 0},
        opacity: refl_alpha
      },
      z: trace_values_r['values'],
      zmin: 0, zmax: 80,
      // colorbar: {x: 0.5, y:-0.9, orientation: 'h', thickness: 15, len: 1, ypad: 0},
      colorbar: { orientation: 'h', thickness: 15, y: -0.1, len: 1},
      hoverinfo: "skip",
      customdata: plot_coords_r,
      colorscale: 'Jet',
      geojson: plot_geom_r
    };
    all_traces = [map_data, refl_data].flat();
  }
  // map object layers + settings
  let layout = {
    title: {text: get_title_timestamp(selectedModelRun, selectedForecast), x: 0.05, font: {size: 22}},
    uirevision:'true',
    width: '100%',
    mapbox: {
      style: "carto-darkmatter",
      layers: [
        {
          sourcetype: "geojson",
          source: "/geojson-counties-fips.json", // county boundaries
          type: "line",
          color: "#BA9DD5",
          line: {"width": 0.25},
          below: "traces"
        },
        {
          sourcetype: "geojson",
          source: "/cnty_warn_bnds.json", // county warning boundaries
          type: "line",
          color: "yellow",
          line: {"width": 0.4, opacity: 0.0},
          below: "traces"
        }
      ],
      center: {lon: domain[2][0], lat: domain[2][1]},
      zoom: 5
    }
  };

  let config = {responsive: true}

  return (
    <div id="viz-outer-container">
      <Plots all_traces={all_traces} layout={layout} config={config} fcst_dates={fcst_dates} msg_file_len={msg_file_len} domain={domain} transformer={transformer} lon_array_m={lon_array_m} lat_array_m={lat_array_m} radius={radius} json={json}/>
    </div>
  );
}

function derive_new_proj(base_transformer, coord) {
  console.log("derive_new_proj() called")
  // Returns: a projection object (?), creates projection system from the data for transformation later
  let center_proj_x = coord[1] + (3000 * 150) + 1500
  let center_proj_y = coord[0] + (3000 * 150) + 1500
  let center_lonlat = base_transformer.forward([center_proj_y, center_proj_x])
  let proj ="+proj=lcc +lat_0=" + center_lonlat[1] + " +lon_0=" + center_lonlat[0] + " +lat_1=30 +lat_2=60 +a=6370000 +b=6370000 +ellps=WGS84";

  return proj
}

function build_data_object(transformer, selectedEnsemble, start,end,data) {
  console.log("-------------------build_data_object() called")
  // Returns: None. for each timestamp of the data, creates a FeatureCollection where each data coordinate is represented by a list of cornerpoints that center it
  // and saves it to obj_dict_out.
  // Parameters on initialization: build_data_object(0,1,json,plot_d);
  console.log(data)

  let obj_dict_out = {};

  // reprojecting the coordinates in the data
  let coord = transformer.inverse(data['fm_0']['se_coords'])
  let lon_array_m = create_coord_array(coord[0], wofs_x_length, resolution)
  let lat_array_m = create_coord_array(coord[1], wofs_y_length, resolution)

  // creating a FeatureCollection for each timestamp
  for (let i of d3.range(start, end)) {
    let minutes = i*5
    let subset = data["fm_" + minutes]["MEM_" + selectedEnsemble]

    let plot_data = create_geom_object(transformer, subset["rows"], subset["columns"], lon_array_m, lat_array_m)
    obj_dict_out[minutes + "_" + selectedEnsemble] = plot_data
  }
  return obj_dict_out;
}

function create_coord_array(coord, len, resolution) {
  console.log("create_coord_array() called")
  // Returns: an array of coordinates constructed based on the resolution and length of provided data
  let array = new Array(len);
  for (let i=0; i<len; i++) { array[i] = coord + (resolution * i); }
  return array
}

function create_geom(transformer, i, j, lons, lats) {
  console.log("create_geom() called")
  // Returns a list of five (?) coordinates representing the corners of a square on the grid in which a data coordinate is centered

  // radius representing the size of a grid cell to center the data point within corner coordinates
  let south_lat_m = lats[i] - radius
  let north_lat_m = lats[i] + radius
  let west_lon_m = lons[j] - radius
  let east_lon_m = lons[j] + radius

  let se = transformer.forward([east_lon_m, south_lat_m])
  let ne = transformer.forward([east_lon_m, north_lat_m])
  let sw = transformer.forward([west_lon_m, south_lat_m])
  let nw = transformer.forward([west_lon_m, north_lat_m])

  return [sw, nw, ne, se, sw]
}

function create_geom_object(transformer, i_indices, j_indices, lons, lats) {
  console.log("create_geom_object() called")
  // Returns: FeatureCollection representing the coordinate grid provided as parameters
  // Parameters on initialization: subset["rows"], subset["columns"], lon_array_m, lat_array_m
  let coords = new Array(i_indices.length)

  // making new FeatureCollection of size corresponding to the provided coordinate arrays
  let grid_obj = {type: "FeatureCollection", features: new Array(i_indices.length)}
  // constructing an array of cornerpoints for each part of the grid and adding it to the FeatureCollection
  for (let index=0; index < i_indices.length; index++ ) {
      coords[index] = [i_indices[index], j_indices[index]]
      let geom = create_geom(transformer, i_indices[index], j_indices[index], lons, lats)
      let grid_cell_obj = {type: "Feature",
                           id: index,
                           geometry: {type: "Polygon", coordinates: [geom]}}
      grid_obj["features"][index] = grid_cell_obj
  }
  return [grid_obj, coords]
}

function get_wofs_domain_geom(transformer, lon_array_m, lat_array_m) {
  console.log("get_wofs_domain_geom() called")
  // ? Returns array of corner coordinates + center point of data provided
  let se = transformer.forward([lon_array_m[0], lat_array_m[0]]);
  let sw = transformer.forward([lon_array_m[wofs_x_length - 1], lat_array_m[0]]);
  let nw = transformer.forward([lon_array_m[wofs_x_length - 1], lat_array_m[wofs_y_length - 1]]);
  let ne = transformer.forward([lon_array_m[0], lat_array_m[wofs_y_length - 1]]);
  let center = transformer.forward([lon_array_m[Math.floor(wofs_x_length / 2)], lat_array_m[Math.floor(wofs_y_length / 2)]])
  let lons = [se[0], sw[0], nw[0], ne[0], se[0]]
  let lats = [se[1], sw[1], nw[1], ne[1], se[1]]

  return [lons, lats, center]
}

function get_fcst_date_range(selectedModelRun, interval) {
  console.log("get_fcst_date_range() called")
  // get list of forecast dates/times based on the given interval of minutes
  let datetime = selectedModelRun;

  let year = datetime.substring(0, 4);
  let month = parseInt(datetime.substring(4, 6)) - 1;
  let day = datetime.substring(6, 8);
  let start_hour = datetime.substring(8, 10);
  let start_min = datetime.substring(10, 12);
  let start_hour_int = parseInt(start_hour);
  let start_date = new Date(year, month, day, start_hour, start_min);
  if (start_hour_int <=4)
  {
    start_date = new Date(start_date.getTime() + 86400000);
  }
  var end_date = new Date(start_date.getTime() + 3 * 3600000 + 5 * 60000);
  let date_range = d3.timeMinutes(start_date,
          end_date, interval);
  return date_range;
}

function get_title_timestamp(selectedModelRun, selectedForecast) {
  console.log("get_title_timestamp() called")
  // formatting the plot title
  var datetime = selectedModelRun;

  var year = datetime.substring(0, 4)
  var month = parseInt(datetime.substring(4, 6)) - 1
  var day = datetime.substring(6, 8)
  var hour = datetime.substring(8, 10)
  var minute = datetime.substring(10, 12)
  var forecast_minutes = selectedForecast;

  var time_ms = new Date(Date.UTC(year, month, day, hour, minute)).getTime()
  var forecast_mins_in_ms = forecast_minutes * 60 * 1000
  var date_string = new Date(time_ms + forecast_mins_in_ms).toUTCString()

  return "Probability of Tornado: " + date_string
}

function select_trace(data, geom, selectedForecast, selectedEnsemble) {
  console.log("select_trace() called")
  // seems like this enables selecting the correct data for the given chosen grid cell so that 
  // it syncs on the map and spaghetti plot ?
  
  let p = data["fm_" + String(parseInt(selectedForecast))]['MEM_' + selectedEnsemble]
  let geo = geom[String(parseInt(selectedForecast)) + "_" + selectedEnsemble]
  console.log([p,geo])
  return [p, geo]
}