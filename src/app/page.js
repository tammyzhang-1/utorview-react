'use client'
import Controls from './components/Controls.js'
import Visualizations from './components/Visualizations.js'
import useSWR from 'swr'
import * as d3 from 'd3';

// font imports
import { Poppins } from 'next/font/google'
const poppins = Poppins({
  weight: '400',
  subsets: ['latin'],
})

// data fetcher constants
const fetcher = (url) => fetch(url).then((res) => res.text());
const url = "/available_dates.csv"

export default function App() {
  console.log("render occurred! App")
  const { data, error, isLoading } = useSWR(url, fetcher, {revalidateOnFocus: false});

  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading...</div>
 
  return (
      <main className={poppins.className}>
          <Controls modelDates={formatDates(data)} />
      </main>
  )
}

function formatDates(date_str) {
  // Returns: an array of strings representing model run timestamps. Used to populate Model Run dropdown.
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
  let datesFinal = dates.map(rd => formatTimeLabel(rd));
  let datesIndex = dates.map(rd => formatTimeValue(rd))
  return [datesFinal, datesIndex];
}

