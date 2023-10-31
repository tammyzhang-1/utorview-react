'use client'
import Controls from './components/Controls.js'
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

const formatTimeValue = d3.utcFormat("%Y%m%d%H%M");
const formatTimeLabel = d3.utcFormat("%Y %b %d %H%M UTC");

export default function App() {
  console.log("render occurred! App")
  const { data, error, isLoading } = useSWR(url, fetcher, {revalidateOnFocus: false});

  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading...</div>

  let dateList = formatDates(data);
 
  return (
      <main className={poppins.className}>
          <Controls modelDates={dateList.map(rd => formatTimeLabel(rd))} modelDateValues={dateList.map(rd => formatTimeValue(rd))} />
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

  return dates;
}

