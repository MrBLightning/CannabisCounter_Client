import React, { ReactElement } from "react"
import { GoogleMap, withScriptjs, withGoogleMap, GoogleMapProps } from "react-google-maps"

const API_KEY = "AIzaSyDjd99ftyM86pfGS0TinrJnWHBz9jLPxLE"

type CustomMapProps = {
    loadingElement?: ReactElement,
    containerElement?: ReactElement,
    mapElement?: ReactElement,
}

const CustomMapComponent = withScriptjs(withGoogleMap((props: GoogleMapProps) =>
    <GoogleMap
        {...props} />
))

export const CustomMap: React.FC<CustomMapProps & GoogleMapProps> = (props) => <CustomMapComponent
    {...props}
    googleMapURL={"https://maps.googleapis.com/maps/api/js?key=" + API_KEY + "&v=3.exp"}
    loadingElement={props.loadingElement || <div style={{ height: `100%` }} />}
    containerElement={props.containerElement || <div style={{ height: `400px` }} />}
    mapElement={props.mapElement || <div style={{ height: `100%` }} />}
/>

export type LatLng = {
    lat: number,
    lng: number
}
