import React from "react";
import _ from "underscore";
import moment from "moment";

import {
    Resizable,
    Charts,
    ChartContainer,
    ChartRow,
    YAxis,
    LineChart,
    styler,
    ScatterChart
  } from "react-timeseries-charts";


const style = styler([
    { key: "upperlimit", color: "#7030A0", width: 1, dashed: true },
    { key: "lowerlimit", color: "#7030A0", width: 1, dashed: true },
    { key: "midpoint", color: "#0070C0", width: 1 },
    { key: "vwap", color: "#404040", width: 1 },
]);

class ddos extends React.Component {
   
    constructor(props) {
        super(props);
        this.handleRescale = _.debounce(this.rescale, 300);
        this.state = {
            max: this.props.max,
            min: this.props.min,
            active: {
                midpoint: true,
                connections: false
            },
            timerange: this.props.midpoint.range(),
            tracker: null,
    
        };
    
    }

    componentWillReceiveProps() {
        this.setState({
            'max': this.props.max,
            'min': this.props.min,
            'timerange': this.props.midpoint.range()
        })
    }

    rescale(timerange, active = this.state.active) {
        this.setState({
            'max': this.props.upperlimit.crop(this.state.timerange).max("upperlimit"),
            'min': this.props.lowerlimit.crop(this.state.timerange).min("lowerlimit")
        })
    }

    handleTrackerChanged = (t, scale) => {
        this.setState({
          tracker: t,
          trackerEventUpplimit: t && this.props.upperlimit.at(this.props.upperlimit.bisect(t)),
          trackerEventOutLower: t && this.props.lowerlimit.at(this.props.lowerlimit.bisect(t)),
          trackerEventOutMid: t && this.props.midpoint.at(this.props.midpoint.bisect(t)),
          trackerEventOutVwap: t && this.props.vwap.at(this.props.vwap.bisect(t)),
          trackerX: t && scale(t)
        });
    }

    handleTimeRangeChange = timerange => {
        this.setState({ timerange });
        this.handleRescale(timerange);
    };

    handleActiveChange = key => {
        const active = this.state.active;
        active[key] = !active[key];
        this.setState({ active });
        this.handleRescale(this.state.timerange, active);
    };

    renderChart = () => {
        let charts = [];
        charts.push(
            <LineChart
                key="upperlimit"
                axis="axis1"
                series={this.props.upperlimit}
                columns={["upperlimit"]}
                style={style}
                interpolation="curveBasis"
            />
        );

        charts.push(
            <LineChart
                key="lowerlimit"
                axis="axis1"
                series={this.props.lowerlimit}
                columns={["lowerlimit"]}
                style={style}
                interpolation="curveBasis"
            />
        );

        charts.push(
            <LineChart
                key="vwap"
                axis="axis1"
                series={this.props.vwap}
                columns={["vwap"]}
                style={style}
                interpolation="curveBasis"
            />
        );
        
        charts.push(
            <LineChart
                key="midpoint"
                axis="axis1"
                series={this.props.midpoint}
                columns={["midpoint"]}
                style={style}
                interpolation="curveBasis"
            />
        );   

        charts.push(
            <ScatterChart
                key="vwap"
                axis="axis1"
                series={this.props.vwap}
                columns={["vwap"]}
                style={style}
                interpolation="curveBasis"
            />
        );

        const trackerInfoValues = [
            {
              label: "upperlimit",
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
              label: "vwap",
              value:
                this.state.tracker == null
                  ? ""
                  : this.state.trackerEventOutVwap.get("vwap")
            },
            {
              label: "midpoint",
              value:
                this.state.tracker == null
                  ? ""
                  : this.state.trackerEventOutMid.get("midpoint")
            }

        ]

        const darkAxis = {
            label: {
                stroke: "none",
                fill: "#AAA", // Default label color
                fontWeight: 200,
                fontSize: 14,
                font: '"Goudy Bookletter 1911", sans-serif"'
            },
            values: {
                stroke: "none",
                fill: "#888",
                fontWeight: 100,
                fontSize: 11,
                font: '"Goudy Bookletter 1911", sans-serif"'
            },
            ticks: {
                fill: "none",
                stroke: "#AAA",
                opacity: 0.2
            },
            axis: {
                fill: "none",
                stroke: "#AAA",
                opacity: 1
            }
        };

        return (
            <ChartContainer
                title="Upperlimit | LowerLimit | Vwap | MidPoint"
                style={{
                    // background: "#201d1e",
                    borderRadius: 8,
                    borderStyle: "solid",
                    borderWidth: 1,
                    borderColor: "#232122"
                }}
                timeAxisStyle={darkAxis}
                titleStyle={{
                    color: "#EEE",
                    fontWeight: 500
                }}
                padding={20}
                paddingTop={5}
                paddingBottom={0}
                enablePanZoom={true}
                // enableDragZoom
                onTimeRangeChanged={this.handleTimeRangeChange}
                // timeRange={this.state.timerange}
                timeRange={this.state.timerange ? this.state.timerange : this.props.midpoint.range()}
                maxTime={this.props.midpoint.range().end()}
                minTime={this.props.midpoint.range().begin()}
                trackerPosition={this.state.tracker}
                onTrackerChanged={this.handleTrackerChanged}
            >
                <ChartRow 
                    height="300"
                    trackerInfoValues={trackerInfoValues}
                    trackerInfoWidth={200}
                    trackerInfoHeight={80}
                    infoStyle={{ fill: "white", stroke:"black" }}
                >
                    <YAxis
                        id="axis1"
                        // label="midpoint"
                        // showGrid
                        hideAxisLine
                        transition={300}
                        style={darkAxis}
                        labelOffset={-10}
                        min={this.state.min}
                        max={this.state.max}
                        format=",.0f"
                        width="60"
                        type="linear"
                    />
                    <Charts>{charts}</Charts>
                </ChartRow>
            </ChartContainer>
        );
    };

    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-md-12">
                        <Resizable>{this.renderChart()}</Resizable>
                    </div>
                </div>
            </div>
        );
    }
}

export default ddos