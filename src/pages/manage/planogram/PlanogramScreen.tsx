import React, { Component } from 'react';
import { Switch } from 'react-router-dom';
import {
    Redirect, RouteComponentProps
} from 'react-router';
import PlangoramEditor from './main/PlanogramEditor';
import PlanogramBranchSelection from './main/PlanogramBranchSelection';
import PlangoramView from './main/PlanogramView';
import { ThunkDispatch } from 'redux-thunk';
import { AppState } from 'shared/store/app.reducer';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { fetchCatalog, fetchBarcodeStatuses } from 'shared/api/catalog.provider';
import { setCatalog, setBarcodeStatuses } from 'shared/store/catalog/catalog.action';
import { errorPlanogramView, setStore } from 'shared/store/planogram/store/store.actions';
import { PlanogramDocument } from './main/PlanogramDocument';
import { ProtectedRoute } from 'shared/components/AppRoute';
import PlanogramDashboard from './main/PlanogramDashboard';
import { PlanogramDimension } from './main/PlanogramDimension';

export const PLANOGRAM_BASE_URL = "/planogram"

const mapStateToProps = (state: AppState, ownProps: RouteComponentProps<{}>) => ({
    ...ownProps,
    catalog: state.catalog.products,
    user: state.auth.user
})

const mapDispatchToProps = (dispatch: ThunkDispatch<AppState, {}, AnyAction>) => ({
    fetchCatalog: () => fetchCatalog()
        .then(catalog => dispatch(setCatalog(catalog)))
        .catch((err) => dispatch(errorPlanogramView(err))),
    clearStore: () => dispatch(setStore(null))
})


type PlanogramScreenComponentProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;
class PlanogramScreenComponent extends Component<PlanogramScreenComponentProps> {
    componentDidMount() {
        // this.props.clearStore();
        this.props.fetchCatalog();
        // this.props.fetchBarcodeStatuses();
    }
    render() {
        if (this.props.catalog.length === 0)
            return null;
        const userLevel = this.props.user && this.props.user.level != null ? this.props.user.level : 50;
        return <Switch>
            {/* <Route path={PLANOGRAM_BASE_URL + "/:branch_id/new"} component={PlangoramEditor} /> */}
            <ProtectedRoute
                level={10}
                path={[PLANOGRAM_BASE_URL + "/editor/:store_id"]}
                component={PlangoramEditor} />
            <ProtectedRoute
                level={100}
                path={PLANOGRAM_BASE_URL + "/view/:store_id"}
                component={PlangoramView} />
            <ProtectedRoute
                level={100}
                path={PLANOGRAM_BASE_URL + "/document/:store_id"}
                component={PlanogramDocument} />
            <ProtectedRoute
                level={100}
                path={PLANOGRAM_BASE_URL + "/dimension"}
                component={PlanogramDimension} />      
            <ProtectedRoute
                path={PLANOGRAM_BASE_URL}
                component={userLevel > 10 ? PlanogramBranchSelection : PlanogramDashboard} />
            <Redirect to={PLANOGRAM_BASE_URL} />
        </Switch>;
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(PlanogramScreenComponent)