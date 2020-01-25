import React, { Component, ComponentProps, ReactElement } from 'react'


export default class DashboardMain extends Component<any, any> {
    state = {
        aside: null
    }
    render() {
        const { aside } = this.state;
        return (
            null
            // <div className="planogram-dashboard">
            //     <CustomMap
            //         defaultZoom={16}
            //         options={{
            //             disableDefaultUI: false,
            //             fullscreenControl: false,
            //             streetViewControl: false,
            //             mapTypeControl: false,
            //             styles: mapStyle
            //         }}
            //         defaultCenter={{ lat: 32.081489, lng: 34.779725 }}
            //         mapElement={<div className="planogram-map-container"></div>}
            //         containerElement={<div className="planogram-map"></div>}
            //         loadingElement={<div className="loader"></div>}>
            //         <BranchMarker
            //             title="Awesome branch"
            //             position={{ lat: 32.081489, lng: 34.779725 }}
            //             openDetail={() => {
            //                 this.setState({
            //                     aside: "Awesome branch"
            //                 })
            //             }}
            //             closeDetail={() => {
            //                 this.setState({
            //                     aside: null
            //                 })
            //             }}
            //         />
            //     </CustomMap>
            //     <div className={"detail-aside" + (aside != null ? " open" : "")}>
            //         <div className="detail-header">
            //             <div className="detail-title">
            //                 {aside}
            //             </div>
            //         </div>
            //         <div className="detail-content">

            //         </div>
            //         <div className="detail-actions">
            //             <div className="detail-action">
            //                 <FontAwesomeIcon icon={faStore} />
            //             </div>
            //             <div className="detail-action">
            //                 <FontAwesomeIcon icon={faEye} />
            //             </div>
            //             <div className="detail-action">
            //                 <FontAwesomeIcon icon={faBriefcase} />
            //             </div>
            //         </div>
            //     </div>
            // </div>
        )
    }
}