import Map from './Map.js'
import Chart from './Chart.js'
import * as d3 from 'd3';

export default function Visualizations({times, selectedModelRun, selectedEnsemble, selectedForecast, selectedOverlay, selectedOpacity}) {
    let msg_file_len = get_ens_file_strings(times, selectedModelRun, "wofs_sparse_prob_",5,"ML_PREDICTED_TOR").length;

    let json = {};
    // load_data_parallel("wofs_sparse_prob_","ML_PREDICTED_TOR",0,1,json);

    return (
        <div id="viz-container">
            <Map />
            <Chart />
        </div>
    );
}

function get_ens_file_strings(times, selectedModelRun, file_prefix, interval, variable) {
    console.log("get_ens_file_strings() called")
    // Returns: a list of strings representing URLs to messagepack datasets corresponding to the requested data for the requested time
    // Parameters being used in initialization: "wofs_sparse_prob_",5,"ML_PREDICTED_TOR"
    // file_prefix, interval, and variable are used in order to construct the proper URL at the end

    // taking the currently selected value of the date dropdown menu and parsing it into parts
    const formatTime = d3.timeFormat("%Y%m%d%H%M00");

    var datetime = times[selectedModelRun];
    var year = datetime.substring(0, 4);
    var month = parseInt(datetime.substring(4, 6)) - 1
    var day = datetime.substring(6, 8)
    var start_hour = datetime.substring(8, 10)
    var start_min = datetime.substring(10, 12)
    var start_hour_int = parseInt(start_hour)

    if (start_hour_int <=4)
    {
        var start_date = new Date(year, month, day, start_hour, start_min);
        start_date = new Date(start_date.getTime() + 86400000);
    }
    else
    {
        start_date = new Date(year, month, day, start_hour, start_min);
    }
    var end_date = new Date(start_date.getTime() + 3 * 3600000 + 5 * 60000)

    // returning a list of time objects - minutes separated by interval within the time range
    var end_hour =  end_date.getHours()
    var date_range = d3.timeMinutes(start_date,
        end_date, interval)

    // creating list of strings corresponding to the URLs to the relevant messagepack datasets corresponding to the 
    // list of timestamps just created
    let file_list = [];
    let init_time = datetime.substring(0, 8)
    date_range.forEach(function(x) {file_list.push("https://wofsdltornado.blob.core.windows.net/wofs-dl-preds/"
        + init_time + start_hour + start_min + "/" + file_prefix +  formatTime(x) + "_" + variable + ".msgpk")});

    console.log(file_list)
    return file_list;
}

async function load_data_parallel(file_prefix, variable, start, end, json_out) {
    console.log("load_data_parallel() called")
    // Returns: none. Creates json representations of all requested messagepack datasets and stores it in json_out.
    // function in which the messagepack dataset whose URLs are stored in the result of get_ens_file_strings
    // are requested and loaded into json responses using a messagepack handling library
    var file_list = get_ens_file_strings(file_prefix, 5, variable).slice(start,end)

    return Promise.all(file_list.map(url => fetch(url)))
        .then(responses => Promise.all(responses.map(response => MessagePack.decodeAsync(response.body))))
        .then(messages => {
            j = start
            for (let i=0; i<messages.length; i++) {
                let key = "fm_" + String(j*5)
                json_out[key] = messages[i]
                j += 1
            }
        });
}