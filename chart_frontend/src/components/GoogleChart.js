import React, { useState, useEffect } from "react";
import Chart from "react-google-charts";
const data = [
    ["Year", "Sales", "Expenses"],
    ["2004", 1000, 400],
    ["2005", 1170, 460],
    ["2006", 660, 1120],
    ["2008", 1030, 540],
    ["2009", 1030, 540],
    ["2010", 1030, 540],
    ["2011", 1030, 540],
    ["2012", 1030, 540],
    ["2013", 1030, 540],
    ["2014", 1030, 540],
    ["2015", 1030, 540],
    ["2016", 1030, 540],
    ["2017", 1030, 540],
    ["2018", 1030, 540],
    ["2019", 1030, 540],
    ["2020", 1030, 540],
  ];
  const options = {
    chart: {
      title: "Company Performance",
      subtitle: "Sales & Expenses"
    }
  };

class GoogleChart extends React.Component {
render() {
    return (
        <div>
            <Chart
            chartType="Line"
            width="100%"
            height="400px"
            data={data}
            options={options}
            />
        </div>
    );
}
}

export default GoogleChart;