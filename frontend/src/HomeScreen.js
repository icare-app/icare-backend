import React from "react";

import Timer from "./Timer.js";

const homeStyle = {
    paddingTop: '30px',
    textAlign: 'center',

    // Align home screen in center of Electron window.
    position: 'absolute', left: '50%', top: '50%',
    transform: 'translate(-50%, -50%)'
};

export default class HomeScreen extends React.Component {

    render() {
        return (
            <div style={homeStyle}>
                <Timer />
            </div>
        );
    }
}

