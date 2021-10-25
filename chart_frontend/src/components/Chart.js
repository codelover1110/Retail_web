import React, { useState } from "react";
import { render } from "react-dom";
import { TimeSeries, Index, TimeRange } from "pondjs";
import {
  Resizable,
  Charts,
  ChartContainer,
  ChartRow,
  YAxis,
  LineChart,
  styler,
  Legend,
  ScatterChart
} from "react-timeseries-charts";
import 'react-select/dist/react-select.css';
import { compose } from "redux";


class DataChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timerange: null,
      tracker: null,
      trackerX: null
    }
  }

  timeRangeChanged = (timerange) => {
    this.setState({ timerange });
  };

  handleTrackerChanged = (t, scale) => {
    this.setState({
      tracker: t,
      trackerEventUpplimit: t && this.props.series.at(this.props.series.bisect(t)),
      trackerEventOutLower: t && this.props.series1.at(this.props.series1.bisect(t)),
      trackerEventOutMid: t && this.props.series2.at(this.props.series2.bisect(t)),
      trackerEventOutVwap: t && this.props.series3.at(this.props.series3.bisect(t)),
      trackerX: t && scale(t)
    });
  }


  render() {
    const style = styler([
      {
        key: "upperlimit",
        color: "#7030A0",
        selected: "#7030A0",
        dashed: true,
        width: 1
      },
      {
        key: "lowerlimit",
        color: "#7030A0",
        dashed: true,
        selected: "#7030A0",
        width: 1

      },
      {
        key: "midpoint",
        color: "#0070C0",
        // dashed: true,
        selected: "#0070C0",
        width: 1

      },
      {
        key: "vwap",
        color: "#404040",
        // dashed: true,
        selected: "#404040",
        width: 1

      }
    ]);

    const trackerInfoValues = [
      {
        label: "upplimit",
        value:
          this.state.tracker == null
            ? ""
            : this.state.trackerEventUpplimit.get("upperlimit")
      },
      {
        label: "lowerlimit",
        value:
          this.state.tracker == null
            ? ""
            : this.state.trackerEventOutLower.get("lowerlimit")
      },
      {
        label: "midpoint",
        value:
          this.state.tracker == null
            ? ""
            : this.state.trackerEventOutMid.get("midpoint")
      },
      {
        label: "vwap",
        value:
          this.state.tracker == null
            ? ""
            : this.state.trackerEventOutVwap.get("vwap")
      }
    ];

    return (
      <div className="p-3 m-4 border border-muted">
        <div>
            
        </div>
        <Resizable>
          <ChartContainer
            timeRange={this.state.timerange ? this.state.timerange : this.props.series.range()}
            enablePanZoom={true}
            onTimeRangeChanged={this.timeRangeChanged}
            trackerPosition={this.state.tracker}
            onTrackerChanged={this.handleTrackerChanged}
          >
            <ChartRow
              height="500"
              trackerInfoValues={trackerInfoValues}
              trackerInfoWidth={200}
              trackerInfoHeight={80}
              infoStyle={{ fill: "white", stroke:"black" }}
            >
              <YAxis
                id="rain"
                label="Rainfall (inches/hr)"
                labelOffset={-20}
                min={this.props.min}
                max={this.props.max}
                format=".2f"
                width="100"
                type="linear"
              />
              <Charts>
                <LineChart
                  axis="rain"
                  style={style}
                  spacing={1}
                  columns={["upperlimit"]}
                  series={this.props.series}
                  minBarHeight={1}
                />
                <LineChart
                  axis="rain"
                  style={style}
                  spacing={1}
                  columns={["lowerlimit"]}
                  series={this.props.series1}
                  minBarHeigh={1}
                />
                <LineChart
                  axis="rain"
                  style={style}
                  spacing={1}
                  columns={["midpoint"]}
                  series={this.props.series2}
                  minBarHeigh={1}
                />
                <LineChart
                  axis="rain"
                  label="Rainfall (inches/hr)"
                  style={style}
                  spacing={1}
                  columns={["vwap"]}
                  series={this.props.series3}
                  minBarHeigh={1}
                />
                <ScatterChart 
                  axis="rain"
                  series={this.props.series3}
                  columns={["vwap"]}
                  style={style}
                />
              </Charts>
            </ChartRow>
          </ChartContainer>
        </Resizable>
      </div>
    );
  }
}
export default DataChart;