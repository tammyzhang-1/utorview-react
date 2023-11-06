'use client'
import Chart from './Chart.js'
import dynamic from 'next/dynamic';
import { useState } from 'react';

const Plot = dynamic(()=> {return import ("react-plotly.js")}, {ssr: false})

export default function Plots({all_traces, layout, config, fcst_dates, msg_file_len, domain, transformer, lon_array_m, lat_array_m, radius}) {
    console.log("render occurred! Plots")
    const [selectedPoint, setSelectedPoint] = useState([]);

    function handleSelectPoint(e) {
        setSelectedPoint(e.points[0].customdata);
    }

    if (selectedPoint.length != 0) {
        let cell_domain = get_selected_cell_geom(selectedPoint[0], selectedPoint[1], lon_array_m, lat_array_m, transformer, radius);
        all_traces = [all_traces, cell_domain].flat();
    }

    return (
        <div>
            <div id="map">
                <Plot data={all_traces} layout={layout} config={config} onClick={(e) => handleSelectPoint(e)}/>
            </div>
            <Chart selectedPoint={selectedPoint} fcst_dates={fcst_dates} msg_file_len={msg_file_len} domain={domain} />
        </div>
    )
}

function get_selected_cell_geom(i, j, lon_array_m, lat_array_m, transformer, radius) {
    console.log("get_selected_cell_geom() called")

    // Adds a red outline to the selected cell when the user clicks on it
    let geom = create_geom(transformer, i, j, lon_array_m, lat_array_m, radius)
    let lons = geom.map(item => item[0])
    let lats = geom.map(item => item[1])
  
    let cell_domain = {
        type: "scattermapbox",
        showlegend: false,
        mode: 'lines',
        line: {color: 'red', width: 2},
        lon: lons,
        lat: lats,
        hoverinfo: "skip"
    };
    return cell_domain
}

function create_geom(transformer, i, j, lons, lats, radius) {
    console.log("create_geom() called")
    // Returns a list of five (?) coordinates representing the corners of a square on the grid in which a data coordinate is centered
  
    // radius representing the size of a grid cell to center the data point within corner coordinates
    let south_lat_m = lats[i] - radius
    let north_lat_m = lats[i] + radius
    let west_lon_m = lons[j] - radius
    let east_lon_m = lons[j] + radius

    console.log([south_lat_m, north_lat_m, west_lon_m, east_lon_m])
  
    let se = transformer.forward([east_lon_m, south_lat_m])
    let ne = transformer.forward([east_lon_m, north_lat_m])
    let sw = transformer.forward([west_lon_m, south_lat_m])
    let nw = transformer.forward([west_lon_m, north_lat_m])
  
    return [sw, nw, ne, se, sw]
  }