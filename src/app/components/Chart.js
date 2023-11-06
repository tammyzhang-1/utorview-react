'use client'
import dynamic from 'next/dynamic';
const Plot = dynamic(()=> {return import ("react-plotly.js")}, {ssr: false})

export default function Chart({selectedPoint, fcst_dates, msg_file_len, domain }) {
    console.log("Render occurred! Chart")
    // dictionary of information for spaghetti plot
    console.log(selectedPoint)
    
    let init_trace = {
        x: [fcst_dates[Math.floor(msg_file_len/2)]],
        y: [0.25],
        type: 'scatter',
        showlegend: false,
        opacity: 0
    };

    //dictionary for gray lines to show on spaghetti plot
    let wofs_domain = {
        type: "scatter",
        showlegend: false,
        mode: 'lines',
        line: {color: 'grey', width: 2},
        lon: domain[0],
        lat: domain[1],
    };

    //dictionary for black line on spaghetti plot
    // let cell_domain = {
    //     type: "scatter",
    //     showlegend: false,
    //     mode: 'lines',
    //     line: {color: 'black', width: 2},
    //     lon: null,
    //     lat: null
    // };

    // console.log(init_trace);
    // console.log(wofs_domain)
    // console.log(cell_domain)

    // let all_traces = [init_trace, wofs_domain, cell_domain].flat();
    let all_traces = [init_trace, wofs_domain].flat();

    let layout = {
        showlegend: true,
        // grid: {rows: 1, columns: 1, pattern: 'independent'},
        yaxis: {range: [0, 0.5], title: {text:'Probability of Tornado', font: {size: 20}}},
        xaxis: {range: [fcst_dates[0], fcst_dates[fcst_dates.length-1]], title: {text:'Forecast Date/Time', font: {size: 18}}, tickformat: '%m-%d %H:%M', tickangle: 35},
        shapes: [{
                    type: 'line',
                    x0: fcst_dates[0],
                    y0: 0,
                    x1: fcst_dates[0],
                    y1: 0.5,
                    opacity: 0.3,
                    line: {color: 'rgba(0,128,26,0.68)',
                        width: 10,
                        opacity: 0.5
                    }
                }],
        legend: {
            y: 1,
            x: 0.95,
            // xaxis: 'x2',
            // yaxis: 'y2',
            font: {size: 18},
        }
    }
    let config = {responsive: true}

    return (
        <div id="chart">
            <div id="chart-instruction">
                Click on a probability grid cell to display a spaghetti plot of all ensemble members.
            </div>
            <Plot data={all_traces} layout={layout} config={config}/>
        </div>
    );
}