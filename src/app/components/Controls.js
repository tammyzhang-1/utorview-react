// component holding the user input controls for the visualization
import Select from './Select.js'
import styles from '../page.module.css'; 

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

export default function Controls({ modelDates }) {
    console.log("render occurred! Controls") 
   
    return (
        <div className={styles.controls}>
            <Select 
                label={"Model Run"} 
                options={modelDates}
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