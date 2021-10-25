import React, { useState } from "react";
// import "./App.css";
import * as XLSX from "xlsx";

class ExcelToJson extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.state = {
            file: "",
        };
    }

    handleClick(e) {
        this.refs.fileUploader.click();
    }

    filePathset(e) {
        e.stopPropagation();
        e.preventDefault();
        var file = e.target.files[0];
        // console.log(file);
        this.setState({ file });

        // console.log(this.state.file);
    }

    readFile() {
        var f = this.state.file;
        var name = f.name;
        if (name == null) {
            alert("Please select .xlsx file")
            return
        }
        else if (name.indexOf('.xlsx') < 0) {
            console.log(name.indexOf('.xlsx'), "*****************")
            alert("Please select .xlsx file")
            return
        }
        const reader = new FileReader();
        reader.onload = (evt) => {
            // evt = on_file_select event
            /* Parse data */
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: "binary" });
            /* Get first worksheet */
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            /* Convert array of arrays */
            const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });
            let convertData = this.convertToJson(data)
            /* Update state */
            //   console.log("Data>>>" + data);// shows that excel data is read
            // console.log(this.convertToJson(data)); // shows data in json format
            // console.log(convertData)
        };
        reader.readAsBinaryString(f);
    }

    custom_sort(a, b) {
        return new Date(a[0]).getTime() - new Date(b[0]).getTime();
    }

    convertToJson(csv) {
        var lines = csv.split("\n");

        var result = [];
        var result_1m_midpoint = []
        var result_1m_vwap = []
        var result_1m_upperlimit = []
        var result_1m_lowerlimit = []
        var result_5m_midpoint = []
        var result_5m_vwap = []
        var result_5m_upperlimit = []
        var result_5m_lowerlimit = []
        var result_15m_midpoint = []
        var result_15m_vwap = []
        var result_15m_upperlimit = []
        var result_15m_lowerlimit = []
        var result_30m_midpoint = []
        var result_30m_vwap = []
        var result_30m_upperlimit = []
        var result_30m_lowerlimit = []
        var result_60m_midpoint = []
        var result_60m_vwap = []
        var result_60m_upperlimit = []
        var result_60m_lowerlimit = []
        var result_50m_midpoint = []
        var result_50m_vwap = []
        var result_50m_upperlimit = []
        var result_50m_lowerlimit = []
        var result_500m_midpoint = []
        var result_500m_vwap = []
        var result_500m_upperlimit = []
        var result_500m_lowerlimit = []

        var headers = lines[0].split(",");

        for (var i = 1; i < lines.length; i++) {
            var obj = {};
            var currentline = lines[i].split(",");

            for (var j = 0; j < headers.length; j++) {
                obj[headers[j]] = currentline[j];
            }

            // console.log("------------------------------")
            // console.log(obj.starttime)
            // console.log(obj.interval == 1)
            // console.log(obj)
            result.push(obj);
            if (obj.interval === "1" && obj.starttime !== "") {
                result_1m_midpoint.push([obj.starttime, parseFloat(obj.midpoint)])
                result_1m_vwap.push([obj.starttime, parseFloat(obj.vwap)])
                result_1m_upperlimit.push([obj.starttime, parseFloat(obj.upperlimit)])
                result_1m_lowerlimit.push([obj.starttime, parseFloat(obj.lowerlimit)])
            }
            else if (obj.interval === "5" && obj.starttime !== "") {
                result_5m_midpoint.push([obj.starttime, parseFloat(obj.midpoint)])
                result_5m_vwap.push([obj.starttime, parseFloat(obj.vwap)])
                result_5m_upperlimit.push([obj.starttime, parseFloat(obj.upperlimit)])
                result_5m_lowerlimit.push([obj.starttime, parseFloat(obj.lowerlimit)])
            }
            else if (obj.interval === "15" && obj.starttime !== "") {
                result_15m_midpoint.push([obj.starttime, parseFloat(obj.midpoint)])
                result_15m_vwap.push([obj.starttime, parseFloat(obj.vwap)])
                result_15m_upperlimit.push([obj.starttime, parseFloat(obj.upperlimit)])
                result_15m_lowerlimit.push([obj.starttime, parseFloat(obj.lowerlimit)])
            }
            else if (obj.interval === "30" && obj.starttime !== "") {
                result_30m_midpoint.push([obj.starttime, parseFloat(obj.midpoint)])
                result_30m_vwap.push([obj.starttime, parseFloat(obj.vwap)])
                result_30m_upperlimit.push([obj.starttime, parseFloat(obj.upperlimit)])
                result_30m_lowerlimit.push([obj.starttime, parseFloat(obj.lowerlimit)])
            }
            else if (obj.interval === "60" && obj.starttime !== "") {
                result_60m_midpoint.push([obj.starttime, parseFloat(obj.midpoint)])
                result_60m_vwap.push([obj.starttime, parseFloat(obj.vwap)])
                result_60m_upperlimit.push([obj.starttime, parseFloat(obj.upperlimit)])
                result_60m_lowerlimit.push([obj.starttime, parseFloat(obj.lowerlimit)])
            }
            else if (obj.interval === "50" && obj.starttime !== "") {
                result_50m_midpoint.push([obj.starttime, parseFloat(obj.midpoint)])
                result_50m_vwap.push([obj.starttime, parseFloat(obj.vwap)])
                result_50m_upperlimit.push([obj.starttime, parseFloat(obj.upperlimit)])
                result_50m_lowerlimit.push([obj.starttime, parseFloat(obj.lowerlimit)])
            }
            else if (obj.interval === "500" && obj.starttime !== "") {
                result_500m_midpoint.push([obj.starttime, parseFloat(obj.midpoint)])
                result_500m_vwap.push([obj.starttime, parseFloat(obj.vwap)])
                result_500m_upperlimit.push([obj.starttime, parseFloat(obj.upperlimit)])
                result_500m_lowerlimit.push([obj.starttime, parseFloat(obj.lowerlimit)])
            }
        }
        result_1m_midpoint.sort(this.custom_sort);
        result_1m_vwap.sort(this.custom_sort);
        result_1m_upperlimit.sort(this.custom_sort);
        result_1m_lowerlimit.sort(this.custom_sort);
        result_5m_midpoint.sort(this.custom_sort);
        result_5m_vwap.sort(this.custom_sort);
        result_5m_upperlimit.sort(this.custom_sort);
        result_5m_lowerlimit.sort(this.custom_sort);
        result_15m_midpoint.sort(this.custom_sort);
        result_15m_vwap.sort(this.custom_sort);
        result_15m_upperlimit.sort(this.custom_sort);
        result_15m_lowerlimit.sort(this.custom_sort);
        result_30m_midpoint.sort(this.custom_sort);
        result_30m_vwap.sort(this.custom_sort);
        result_30m_upperlimit.sort(this.custom_sort);
        result_30m_lowerlimit.sort(this.custom_sort);
        result_60m_midpoint.sort(this.custom_sort);
        result_60m_vwap.sort(this.custom_sort);
        result_60m_upperlimit.sort(this.custom_sort);
        result_60m_lowerlimit.sort(this.custom_sort);
        result_50m_midpoint.sort(this.custom_sort);
        result_50m_vwap.sort(this.custom_sort);
        result_50m_upperlimit.sort(this.custom_sort);
        result_50m_lowerlimit.sort(this.custom_sort);
        result_500m_midpoint.sort(this.custom_sort);
        result_500m_vwap.sort(this.custom_sort);
        result_500m_upperlimit.sort(this.custom_sort);
        result_500m_lowerlimit.sort(this.custom_sort);
        this.props.setResult_1m_data({
            "result_1m_midpoint": result_1m_midpoint,
            "result_1m_vwap": result_1m_vwap,
            "result_1m_upperlimit": result_1m_upperlimit,
            "result_1m_lowerlimit": result_1m_lowerlimit,
            // "result_5m_midpoint": ,
            // "result_5m_vwap": ,
            // "result_5m_upperlimit": ,
            // "result_5m_lowerlimit": ,
            // "result_15m_midpoint": ,
            // "result_15m_vwap": ,
            // "result_15m_upperlimit": ,
            // "result_15m_lowerlimit": ,
            // "result_30m_midpoint": ,
            // "result_30m_vwap": ,
            // "result_30m_upperlimit": ,
            // "result_30m_lowerlimit": ,
            // "result_60m_midpoint": ,
            // "result_60m_vwap": ,
            // "result_60m_upperlimit": ,
            // "result_60m_lowerlimit": ,
            // "result_50m_midpoint": ,
            // "result_50m_vwap": ,
            // "result_50m_upperlimit": ,
            // "result_50m_lowerlimit": ,
            // "result_500m_midpoint": ,
            // "result_500m_vwap": ,
            // "result_500m_upperlimit": ,
            // result_500m_lowerlimit
        })
        // console.log(
        //     result_1m_midpoint,
        //     result_1m_vwap,
        //     result_1m_upperlimit,
        //     result_1m_lowerlimit,
        //     result_5m_midpoint,
        //     result_5m_vwap,
        //     result_5m_upperlimit,
        //     result_5m_lowerlimit,
        //     result_15m_midpoint,
        //     result_15m_vwap,
        //     result_15m_upperlimit,
        //     result_15m_lowerlimit,
        //     result_30m_midpoint,
        //     result_30m_vwap,
        //     result_30m_upperlimit,
        //     result_30m_lowerlimit,
        //     result_60m_midpoint,
        //     result_60m_vwap,
        //     result_60m_upperlimit,
        //     result_60m_lowerlimit,
        //     result_50m_midpoint,
        //     result_50m_vwap,
        //     result_50m_upperlimit,
        //     result_50m_lowerlimit,
        //     result_500m_midpoint,
        //     result_500m_vwap,
        //     result_500m_upperlimit,
        //     result_500m_lowerlimit
        // )
        // return (
        //     result_1m_midpoint,
        //     result_1m_vwap,
        //     result_1m_upperlimit,
        //     result_1m_lowerlimit,
        //     result_5m_midpoint,
        //     result_5m_vwap,
        //     result_5m_upperlimit,
        //     result_5m_lowerlimit,
        //     result_15m_midpoint,
        //     result_15m_vwap,
        //     result_15m_upperlimit,
        //     result_15m_lowerlimit,
        //     result_30m_midpoint,
        //     result_30m_vwap,
        //     result_30m_upperlimit,
        //     result_30m_lowerlimit,
        //     result_60m_midpoint,
        //     result_60m_vwap,
        //     result_60m_upperlimit,
        //     result_60m_lowerlimit,
        //     result_50m_midpoint,
        //     result_50m_vwap,
        //     result_50m_upperlimit,
        //     result_50m_lowerlimit,
        //     result_500m_midpoint,
        //     result_500m_vwap,
        //     result_500m_upperlimit,
        //     result_500m_lowerlimit
        // )
        //return result; //JavaScript object
        return JSON.stringify(result); //JSON
    }

    render() {
        return (
            <div>
                <input
                    type="file"
                    id="file"
                    ref="fileUploader"
                    onChange={this.filePathset.bind(this)}
                />
                <button
                    onClick={() => {
                        this.readFile();
                    }}
                >
                    Read File
                </button>
            </div>
        );
    }
}

export default ExcelToJson;