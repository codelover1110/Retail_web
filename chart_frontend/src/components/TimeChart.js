import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import http from "../http-common";
import axios from "axios";
import Select from 'react-select'
import 'react-select/dist/react-select.css';

import _ from "underscore";
import moment from "moment";

import { TimeSeries, Index } from "pondjs";
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import Ddos from "./ddos";

const ddosData = require("./ddos_data.json");
const midpointArr = [];

_.each(ddosData, val => {
  const timestamp = moment(new Date(`2015-04-03T${val["time PST"]}`));
  const httpRequests = val["http requests"];
  midpointArr.push([timestamp.toDate().getTime(), httpRequests]);
});

const SeriesInitial = new TimeSeries({
  name: "midpoint",
  columns: ["time", "midpoint"],
  points: midpointArr
});



const TutorialsList = () => {
  const [selectedOptionExch, setSelectedOptionExch] = useState(null);
  const [selectedOptionTable, setSelectedOptionTable] = useState(null);
  const [selectedOptionSymbol, setSelectedOptionSymbol] = useState(null);
  const [selectedOptionInterval, setSelectedOptionInterval] = useState(null);
  const [selectStart, setSelectStart] = useState(null)
  const [selectEnd, setSelectEnd] = useState(null)
  const [midpointSeries, setMidpointSerines] = useState(SeriesInitial)
  const [vwapSeries, setVwapSeries] = useState(SeriesInitial)
  const [upperlimitSeries, setUpperlimitSeries] = useState(SeriesInitial)
  const [lowerlimitSeries, setLowerlimitSeries] = useState(SeriesInitial)
  const [maxVal, setMaxVal] = useState(35000)
  const [minVal, setMinVal] = useState(30000)

  // useEffect(() => {
  //   get_table_list()
  // }, []);

  const handleChangeExch = (value) => {
    setSelectedOptionExch(value)
  }

  const handleChangeTable = (value) => {
    setSelectedOptionTable(value)
  }

  const handleChangeSymbol = (value) => {
    setSelectedOptionSymbol(value)
  }

  const handleChangeInterval = (value) => {
    setSelectedOptionInterval(value)
  }

  const optionsInterval = [
    { value: '1', label: '1m' },
    { value: '5', label: '5m' },
    { value: '15', label: '15m' },
    { value: '30', label: '30m' },
    { value: '60', label: '60m' },
    { value: '50', label: '50m' },
    { value: '500', label: '500m' }
  ]

  const optionsTable = [
    { value: 'candles', label: 'candles' },
    { value: 'block_candles', label: 'block_candles' },
    { value: 'group_candles', label: 'group_candles' }
  ]

  const optionsExch = [
    { value: 'krkn', label: 'kraken' },
    { value: 'btrx', label: 'bittrex' },
  ]

  const optionsSymbol = [
    { value: 'btcusd', label: 'btc' },
    { value: 'ethusd', label: 'eth' },
  ]

  const convertDate = (data) => {
    if (data == null) {
      return null
    }

    let y_data = data._d.getFullYear()
    let m_data = data._d.getMonth() >= 10 ? data._d.getMonth()+1 : '0'+(data._d.getMonth()+1)
    let d_data = data._d.getDate() >= 10 ? data._d.getDate() : '0'+data._d.getDate()
    let h_data = data._d.getHours() >= 10 ? data._d.getHours(): '0'+data._d.getHours()
    let min_data = data._d.getMinutes() >= 10 ? data._d.getMinutes(): '0'+data._d.getMinutes()
    let s_data = data._d.getSeconds() >= 10 ? data._d.getSeconds(): '0'+data._d.getSeconds()
    let temp_data = `${y_data}-${m_data}-${d_data} ${h_data}:${min_data}:${s_data}`
    return temp_data
  }

  const showResut = () => {
    if (selectedOptionExch == null || selectedOptionInterval == null || selectedOptionSymbol == null || selectedOptionTable == null || selectStart == null ) {
      alert('Need to select values Exch, Interval, Symbol, Table, StartTime')
      return
    }
    let table_name = `${selectedOptionTable.value}_${selectedOptionExch.value}_${selectedOptionSymbol.value}`
  
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        interval: selectedOptionInterval.value,
        table_name: table_name,
        start_time: convertDate(selectStart),
        end_time: convertDate(selectEnd),
      })
    };

    fetch('https://caats.ngrok.io/api/get_data', requestOptions)
        .then(response => response.json())
        .then(data => {

          if (data.chart_data.midpoint.length > 0) {
              let maxSeriesTemp = new TimeSeries({
                name: "upperlimit",
                columns: ["time", "upperlimit"],
                points: data.chart_data.upperlimit
              })
              let minSeriesTemp = new TimeSeries({
                name: "lowerlimit",
                columns: ["time", "lowerlimit"],
                points: data.chart_data.lowerlimit
              })
              setMaxVal(maxSeriesTemp.crop(maxSeriesTemp).max("upperlimit"))
              setMinVal(minSeriesTemp.crop(minSeriesTemp).min("lowerlimit"))

              setMidpointSerines(
                new TimeSeries({
                  name: "midpoint",
                  columns: ["time", "midpoint"],
                  points: data.chart_data.midpoint
                })
              )

              setVwapSeries(
                new TimeSeries({
                  name: "vwap",
                  columns: ["time", "vwap"],
                  points: data.chart_data.vwap
                })
              );
              setUpperlimitSeries(
                new TimeSeries({
                  name: "upperlimit",
                  columns: ["time", "upperlimit"],
                  points: data.chart_data.upperlimit
                })
              );
              setLowerlimitSeries(
                new TimeSeries({
                  name: "lowerlimit",
                  columns: ["time", "lowerlimit"],
                  points: data.chart_data.lowerlimit
                })
              )
          }
          else {
            setMidpointSerines(SeriesInitial)
            setLowerlimitSeries(SeriesInitial)
            setUpperlimitSeries(SeriesInitial)
            setVwapSeries(SeriesInitial)
          }
        });

  }

  return (
    <div>
      <div className="main-container row">
        <div className="col-md-11">          
          <div className="row mt-3">
              <div className="col-md-2">
                <div className="select-wrape">
                  <label>
                    <strong>Exchange:</strong>
                  </label>
                  <Select
                    value={selectedOptionExch}
                    onChange={handleChangeExch}
                    options={optionsExch}
                  />
                </div>
              </div>
              <div className="col-md-2">
                <div className="select-wrape">
                  <label>
                    <strong>Symbol:</strong>
                  </label>
                  <Select
                    value={selectedOptionSymbol}
                    onChange={handleChangeSymbol}
                    options={optionsSymbol}
                  />
                </div>
              </div>
              <div className="col-md-2">
                <div className="select-wrape">
                  <label>
                    <strong>Candle:</strong>
                  </label>
                  <Select
                    value={selectedOptionTable}
                    onChange={handleChangeTable}
                    options={optionsTable}
                  />
                </div>
              </div>
              <div className="col-md-2">
                <div className="select-wrape">
                  <label>
                    <strong>Interval:</strong>
                  </label>
                  <Select
                    value={selectedOptionInterval}
                    onChange={handleChangeInterval}
                    options={optionsInterval}
                  />
                </div>
              </div>
              <div className="col-md-2">
                <div className="select-wrape">
                  <label>
                    <strong>Start Time:</strong>
                  </label>
                  <Datetime onChange={(value) => setSelectStart(value)} inputProps={{placeholder: 'DD-MM-YYYY HH:mm'}}/>
                </div>
              </div>
              <div className="col-md-2">
                <div className="select-wrape">
                  <label>
                    <strong>End Time:</strong>
                  </label>
                  <Datetime
                    onChange={(value) => setSelectEnd(value)}
                    inputProps={{placeholder: 'DD-MM-YYYY HH:mm'}}
                  />
                </div>
              </div>
          </div>
        </div>
        <div className="col-md-1 d-flex justify-content-center align-items-center">
          <button className="btn btn-success" style={{marginTop: 45}} onClick={showResut}>
            Show
          </button>
        </div>
      </div>  
      <div>
        <div className="p-3 m-4 border border-muted">
          <Ddos 
            midpoint = {midpointSeries}
            vwap = {vwapSeries}
            upperlimit = {upperlimitSeries}
            lowerlimit = {lowerlimitSeries}
            max = {maxVal}
            min = {minVal}
          />
        </div>
      </div>
    </div>

  );
};

export default TutorialsList;
