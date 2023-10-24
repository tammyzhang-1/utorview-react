'use client'
import dynamic from 'next/dynamic';
const Plot = dynamic(()=> {return import ("react-plotly.js")}, {ssr: false})

var trace1 = {
    x: [5, 0],
    y: [0, 1],
    type: 'scatter',
    opacity: 0
  };
  
  var data = [trace1];

export default function Chart() {
    return (
        <div id="chart">
            <div id="chart-instruction">
                Click on a probability grid cell to display a spaghetti plot of all ensemble members.
            </div>
            <Plot data={data} />
        </div>
    );
}