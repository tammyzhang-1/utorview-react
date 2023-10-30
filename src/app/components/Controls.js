'use client'
import { useState } from 'react';
import Select from './Select.js'
import Visualizations from './Visualizations.js'

// formatting dropdown options for Ensemble Members
let ensembleNum = Array.from(Array(18), (e,i)=>i+1); // creating option for ensemble members 1-18
let ensembleNumOpts = ensembleNum.map(num => ("Member " + (num)));

// concatenating some ensemble aggregates before the list of individual members
let ensembleOpts = ["Median", "Mean", "Max"].concat(ensembleNumOpts);
let ensembleValues = ["median", "mean", "max"].concat(ensembleNum);

// formatting dropdown options for Forecast Hours
let totalMinutesElapsed = 180; // total forecast length in minutes available in dropdown (default: 3 hours)
let minuteInterval = 5; // gap between available forecast timestamps
let forecastValues = Array.from({ length: (totalMinutesElapsed / minuteInterval) + 1 }, (_, index) => index * minuteInterval);

// writing a loop to create a list of timestamp strings
let forecastOpts = forecastValues.map(function(interval) {
    const hours = Math.floor(interval / 60).toString().padStart(2, '0');
    const mins = (interval % 60).toString().padStart(2, '0');
    return `${hours}:${mins}`}
)

export default function Controls({ modelDates, modelDateValues }) {
    console.log("render occurred! Controls") 

    const [selectedModelRun, setSelectedModelRun] = useState(modelDateValues[0]);
    const [selectedEnsemble, setSelectedEnsemble] = useState(ensembleValues[0]);
    const [selectedForecast, setSelectedForecast] = useState(forecastValues[0]);

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
                    label={"Model Run"} 
                    options={modelDates}
                    values={modelDateValues}
                    selectedValue={selectedModelRun}
                    setSelectedValue={setSelectedModelRun}
                />
                <Select 
                    label={"Ensemble Member"} 
                    options={ensembleOpts}
                    values={ensembleValues}
                    selectedValue={selectedEnsemble}
                    setSelectedValue={setSelectedEnsemble}
                />
                <Select 
                    label={"Forecast Hour"} 
                    options={forecastOpts}
                    values={forecastValues}
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
            <div>
                <p>State tracker: Model Run is {selectedModelRun} </p>
                <p>State tracker: Ensemble is {selectedEnsemble} </p>
                <p>State tracker: Forecast is {selectedForecast}</p>
                <p>State tracker: Overlay is {selectedOverlay}</p>
                <p>State tracker: Opacity is {selectedOpacity}</p>
            </div>
            <Visualizations 
                times={modelDates}
                selectedModelRun={selectedModelRun}
                selectedEnsemble={selectedEnsemble}
                selectedForecast={selectedForecast}
                selectedOverlay={selectedOverlay}
                selectedOpacity={selectedOpacity}
            />
        </div>
    );
}