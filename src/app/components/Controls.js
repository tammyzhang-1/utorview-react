// component holding the user input controls for the visualization
import Select from './Select.js'
import styles from '../page.module.css'; 
import * as d3 from 'd3';
import useSWR from 'swr'

// formatting dropdown options for Model Run
let modelOpts = [];
const fetcher = (url) => fetch(url).then((res) => res.text());

function formatDates(date_str) {
    // Returns: none. Changes value of modelOpts variable to an array of formatted strings representing model run timestamps.
    // Parameter date_str: the data returned from a SWR fetch request to a csv file holding available dates.
    let valid_init_hours=[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
    let run_date_strs = date_str.split("\n");
    let dates = [];
    for (let i=0; i< run_date_strs.length; i++) {
        dates.push(new Date(Date.UTC(parseInt(run_date_strs[i].substring(0, 4)),
                            parseInt(run_date_strs[i].substring(4, 6)) -1,
                            parseInt(run_date_strs[i].substring(6, 8)),
                            parseInt(run_date_strs[i].substring(8, 10)),
                            parseInt(run_date_strs[i].substring(10, 12)))
        ));
    }
    dates = dates.filter(function(d) {return valid_init_hours.includes(d.getUTCHours());});
    dates = dates.reverse();
        
    // formatting for time and date in the dropdown
    const formatTimeValue = d3.utcFormat("%Y%m%d%H%M");
    const formatTimeLabel = d3.utcFormat("%Y %b %d %H%M UTC");

    // loop that adds valid dates/times to the dropdown
    let dates_final = dates.map(rd => formatTimeLabel(rd))
    modelOpts = dates_final
}

//// formatting dropdown options for Ensemble Members
let ensembleNum = Array.from(Array(18).keys()) // creating option for ensemble members 1-18
let ensembleNumOpts = ensembleNum.map(num => ("Member " + (num+1)))

// concatenating some ensemble aggregates before the list of individual members
let ensembleOpts = ["Median", "Mean", "Max"].concat(ensembleNumOpts) 

//// formatting dropdown options for Forecast Hours
let totalMinutesElapsed = 180; // total forecast length in minutes available in dropdown (default: 3 hours)
let minuteInterval = 5; // gap between available forecast timestamps
let forecastIntervals = Array.from({ length: (totalMinutesElapsed / minuteInterval) + 1 }, (_, index) => index * minuteInterval);

// writing a loop to create a list of timestamp strings
let forecastOpts = forecastIntervals.map(function(interval) {
    const hours = Math.floor(interval / 60).toString().padStart(2, '0');
    const mins = (interval % 60).toString().padStart(2, '0');
    return `${hours}:${mins}`}
)

export default function Controls() {
    console.log("render occurred! Controls")

    // const url = 'https://wofsdltornado.blob.core.windows.net/wofs-dl-preds/available_dates.csv';
    const url = "/available_dates.csv"
    const { data, error } = useSWR(url, fetcher, {revalidateOnFocus: false});

    if (data) {
        formatDates(data);
    }
   
    return (
        <div className={styles.controls}>
            <Select 
                label={"Model Run"} 
                options={modelOpts}
            />
            <Select 
                label={"Ensemble Member"} 
                options={ensembleOpts}
            />
            <Select 
                label={"Forecast Hour"} 
                options={forecastOpts}
            />
            <label>
                Reflectivity Overlay: <input type="checkbox" name="reflectivityCheck" />
            </label>
            <label>
                Opacity: <input type="range" min="0" max="100" defaultValue="10"></input>
            </label>
        </div>
    );
}