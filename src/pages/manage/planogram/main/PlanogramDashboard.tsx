import React, { Component } from 'react';
import { Route, RouteComponentProps, withRouter, NavLink } from 'react-router-dom';
import { PLANOGRAM_BASE_URL } from '../PlanogramScreen';
import { CustomMap, LatLng } from './components/map/MapComponent';
import { Marker, InfoWindow } from 'react-google-maps';
import mapStyle from './components/map/map-style.json';
import yochaIcon from 'assets/images/yocha-icon.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faEye, faBriefcase } from '@fortawesome/free-solid-svg-icons';
import { AppState } from 'shared/store/app.reducer';
import * as System from 'shared/interfaces/models/System';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { PlanogramStoreRecord, fetchStores, fetchBranchStores } from 'shared/api/planogram.provider';
import { uiNotify } from 'shared/components/Toast';
import { setBranches } from 'shared/store/system/data/data.actions';
import { fetchBranches, fetchBranchDetail } from 'shared/api/settings.provider';
import PlanogramStoreSelection from './PlanogramStoreSelection';

const mapStateToProps = (state: AppState, ownProps: RouteComponentProps<{ branch_id?: string }>) => ({
    ...ownProps,
    branches: state.system.data.branches,
    branchMap: state.system.data.branchesMap,
})

const mapDispatchToProps = (dispatch: ThunkDispatch<AppState, any, AnyAction>) => ({
    setBranches: (branches: System.Branch[]) => dispatch(setBranches(branches))
})

export type PlanogramDashboardProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

class PlanogramDashboardComponent extends Component<PlanogramDashboardProps, {
    // stores: PlanogramStoreRecord[]
    selectedBranch: System.Branch | null,
    mapZoom: number,
}> {
    state = {
        selectedBranch: null,
        mapZoom: 8
    }
    componentDidMount() {
        const { branches, setBranches } = this.props;
        if (branches.length === 0)
            fetchBranches()
                .then(branches => setBranches(branches))
                .catch(err => {
                    uiNotify("Unable to get branches", "error", 5000);
                })
    }
    render() {
        const { selectedBranch } = this.state;
        const { branchMap, branches } = this.props;
        return (<div className="planogram-dashboard planogram-selection">
            <CustomMap
                defaultZoom={this.state.mapZoom}
                options={{
                    disableDefaultUI: false,
                    fullscreenControl: false,
                    streetViewControl: false,
                    mapTypeControl: false,
                    styles: mapStyle
                }}
                onClick={() => {
                    this.props.history.push(PLANOGRAM_BASE_URL);
                }}
                // defaultCenter={{ lat: 32.081489, lng: 34.779725 }}
                defaultCenter={{ lat: 31.194596, lng: 35.031579 }}
                mapElement={<div className="planogram-map-container"></div>}
                containerElement={<div className="planogram-map"></div>}
                loadingElement={<div className="loader"></div>}>
                {branches.map((branch) => {
                    if (!branch.Latitude || !branch.Longitude)
                        return null;
                    return (<BranchMarker
                        key={"PLS_" + branch.BranchId}
                        id={branch.BranchId + ""}
                        title={branch.Name}
                        position={{ lat: branch.Latitude, lng: branch.Longitude }} />)
                })}
            </CustomMap>
            <Route path={PLANOGRAM_BASE_URL + "/:branch_id?"} component={DashboardAside} />
        </div>);
    }
}

type BranchDetailItem = {
    Name: string,
    BranchId: number,
    StoreId?: number
}

type DashboardAsideProps = RouteComponentProps<{
    branch_id?: string
}>;
type DashboardAsideState = {
    loading: boolean,
    branch_id: string | null,
    branchDetail: BranchDetailItem | null
}
class DashboardAside extends Component<DashboardAsideProps> {
    state: DashboardAsideState = {
        loading: false,
        branch_id: this.props.match.params.branch_id || null,
        branchDetail: null
    }
    componentWillReceiveProps(nextProps: any) {
        if (nextProps.match.params.branch_id !== this.props.match.params.branch_id) {
            if (nextProps.match.params.branch_id) {
                this.getBranchDetail(nextProps.match.params.branch_id)
                this.setState({
                    branch_id: nextProps.match.params.branch_id
                });
            }
            else {
                this.setState({
                    branchDetail: undefined,
                    branch_id: undefined
                })
            }
        }
    }
    getBranchDetail = async (branchId: string | number) => {
        try {
            this.setState({ loading: true })
            const branchDetail = await fetchBranchDetail(branchId);
            this.setState({
                branchDetail,
                loading: false
            })
        } catch (error) {
            uiNotify("Unable to load branch details.");
            this.setState({ loading: false })
            this.props.history.push(PLANOGRAM_BASE_URL)
        }
    }
    componentDidMount() {
        if (this.state.branch_id)
            this.getBranchDetail(this.state.branch_id);
    }
    render() {
        const { branch_id, branchDetail, loading } = this.state;
        // if (branch == null) return null;
        return (<div className={"detail-aside" + (branch_id ? " open" : "")}>
            {loading ? <div className="loader"></div> : null}
            {branchDetail ?
                <React.Fragment>
                    <div className="detail-header">
                        <div className="detail-title">
                            <h1>
                                {branchDetail.Name}({branchDetail.BranchId})
                            </h1>
                        </div>
                    </div>
                    <div className="detail-content">
                        <PlanogramStoreSelection branch_id={branchDetail.BranchId + ""} />
                    </div>
                    <div className="detail-actions">
                        {branchDetail.StoreId ? <div className="detail-action">
                            <NavLink to={`${PLANOGRAM_BASE_URL}/${branchDetail.BranchId}/${branchDetail.StoreId}`} className="action-link">
                                <FontAwesomeIcon icon={faStore} />
                            </NavLink>
                        </div> : null}
                        <div className="detail-action">
                            <NavLink to={PLANOGRAM_BASE_URL} className="action-link">
                                <FontAwesomeIcon icon={faEye} />
                            </NavLink>
                        </div>
                        <div className="detail-action">
                            <NavLink to={PLANOGRAM_BASE_URL} className="action-link">
                                <FontAwesomeIcon icon={faBriefcase} />
                            </NavLink>
                        </div>
                    </div>
                </React.Fragment> : null}
        </div>);
    }
}


type BranchMarkerProps = {
    title: string,
    id: string,
    position: LatLng,
    openDetail?: () => void,
    closeDetail?: () => void
} & RouteComponentProps<{ branch_id: string }>;
class BranchMarkerComponent extends Component<BranchMarkerProps> {
    state = {
        popOpen: false
    };
    render() {
        const { push: pushUrl } = this.props.history;
        const { title, position, openDetail, closeDetail, id } = this.props;
        return (<Marker
            clickable
            labelClass="map-marker-label"
            icon={yochaIcon}
            onClick={(e) => {
                if (e.ya && e.ya.stopPropagation)
                    e.ya.stopPropagation();
                pushUrl(PLANOGRAM_BASE_URL + "/" + id)
                this.setState({ popOpen: true });
            }}
            position={position}>
            {this.state.popOpen ? <InfoWindow onCloseClick={() => {
                pushUrl(PLANOGRAM_BASE_URL)
                this.setState({ popOpen: false });
            }}>
                <div>
                    {title}
                </div>
            </InfoWindow> : null}
        </Marker>);
    }
}
const BranchMarker = withRouter(BranchMarkerComponent);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PlanogramDashboardComponent));