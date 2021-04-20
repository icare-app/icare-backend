import React from "react";

import { Text } from "@fluentui/react/lib/Text";
import PieChart from "./charts/PieChart";
import BarChart from "./charts/BarChart";

const divStyle = {
  paddingTop: "10px",
  paddingLeft: "30px",
};

export default class UsageScreen extends React.Component {
  render() {
    return (
      <div style={divStyle}>
        <Text variant={"xxLarge"} block>
          <b>Usage Statistics</b>
        </Text>
        <BarChart />
        <PieChart />
      </div>
    );
  }
}
