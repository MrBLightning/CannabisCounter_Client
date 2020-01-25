import React from 'react'

export default class NotFound extends React.Component {
    render() {
        return (
            <div className="page-wrapper">
                <div className="not-found">
                    <h1>דף זה לא נמצא</h1>
                    <p>אם אתה רואה את זה סימן שצריך לחזור חזרה.</p>
                </div>
            </div>
        );
    }
}