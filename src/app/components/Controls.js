'use client'
import { useState } from 'react';
import Select from './Select.js'
import Visualizations from './Visualizations.js'

// formatting dropdown options for Ensemble Members
let ensembleNum = Array.from(Array(18).keys()) // creating option for ensemble members 1-18
let ensembleNumOpts = ensembleNum.map(num => ("Member " + (num+1)))

// concatenating some ensemble aggregates before the list of individual members
let ensembleOpts = ["median", "mean", "max"].concat(ensembleNumOpts) 

// formatting dropdown options for Forecast Hours
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

    const [selectedModelRun, setSelectedModelRun] = useState(0);
    const [selectedEnsemble, setSelectedEnsemble] = useState(0);
    const [selectedForecast, setSelectedForecast] = useState(0);

    const [selectedOverlay, setSelectedOverlay] = useState(false);
    const [selectedOpacity, setSelectedOpacity] = useState(10);

    // const [selectedOptions, setSelectedOptions] = useState({
    //     modelRun: 0,
    //     ensembleMember: 0,
    //     forecastHour: 0,
    //     reflectivityCheck: false,
    //     opacityRange: 10
    // })

    // function handleOptionsChange(e) {
    //     setSelectedOptions({
    //       ...selectedOptions,
    //       [e.target.name]: e.target.value
    //     });
    // }
   
    return (
        <div id="container">
            <div id="controls">
                <Select 
                    id={"modelRun"}
                    label={"Model Run"} 
                    options={modelDates[0]}
                    selectedValue={selectedModelRun}
                    setSelectedValue={setSelectedModelRun}
                />
                <Select 
                    id={"ensembleMember"}
                    label={"Ensemble Member"} 
                    options={ensembleOpts}
                    selectedValue={selectedEnsemble}
                    setSelectedValue={setSelectedEnsemble}
                />
                <Select 
                    id={"forecastHour"}
                    label={"Forecast Hour"} 
                    options={forecastOpts}
                    selectedValue={selectedForecast}
                    setSelectedValue={setSelectedForecast}
                />
                <label>
                    Reflectivity Overlay: 
                    <input type="checkbox" name="reflectivityCheck" 
                        checked={selectedOverlay}
                        onChange={e => setSelectedOverlay(e.target.checked)}
                    />
                </label>
                <label>
                    Opacity: 
                    <input type="range" min="0" max="100" name="opacityRange"
                        value={selectedOpacity}
                        onChange={e => setSelectedOpacity(e.target.value)}>
                    </input>
                </label>
            </div>
            <Visualizations 
                times={modelDates}
                selectedModelRun={modelDates[1][selectedModelRun]} 
                selectedEnsemble={ensembleOpts[selectedEnsemble]} 
                selectedForecast={forecastOpts[selectedForecast]}
                selectedOverlay={selectedOverlay}
                selectedOpacity={selectedOpacity}
            />
        </div>
    );
}