'use client'
import dynamic from 'next/dynamic';
import styles from '../page.module.css';

const Plot = dynamic(()=> {return import ("react-plotly.js")}, {ssr: false})

export default function Map() {
    console.log("render occurred! Map")
    const data = [
        {
          type: 'scattermapbox',
          mode: 'markers',
          lat: [],
          lon: [],
          marker: {},
        },
      ];
    
      // Layout configuration for the map
      const layout = {
        autosize: true,
        margin: {
            t: 0,
            b: 0,
            r: 0,
            l: 0
        },
        mapbox: {
            style: 'carto-darkmatter',
            center: {
            lat: 40,
            lon: -90,
          },
          zoom: 4,
        },
      };
      return (
        <div id="map" className={styles.map}>
            <Plot data={ data } layout={ layout }/>
        </div>
      );
}
