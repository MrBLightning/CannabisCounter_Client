import React from 'react';

import { AnyAction } from 'redux';
import { AppState } from 'shared/store/app.reducer';
import { withRouter, RouteComponentProps, NavLink, Route } from 'react-router-dom';
import { fetchBranches } from 'shared/api/settings.provider';
import * as System from 'shared/interfaces/models/System';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import PlanogramStoreSelection from './PlanogramStoreSelection';
import { PLANOGRAM_BASE_URL } from '../PlanogramScreen';
import { setBranches } from 'shared/store/system/data/data.actions';
import { uiNotify } from 'shared/components/Toast';



const mapStateToProps = (state: AppState, props: RouteComponentProps<{}>) => {
    return {
        ...props,
        branches: state.system.data.branches,
        user: state.auth.user
    }
};
const mapDispatchToProps = (dispatch: ThunkDispatch<AppState, {}, AnyAction>) => ({
    setBranches: (branches: System.Branch[]) => dispatch(setBranches(branches))
})

type PlanogramStateProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>
class PlanogramSelection extends React.Component<PlanogramStateProps> {
    componentDidMount() {
        fetchBranches().then((branches) => {
            this.props.setBranches(branches);
        }).catch((err) => {
            console.error(err);
            uiNotify("Unable to load branches");
        });
    }

    render() {
        const { user, branches } = this.props;
        // const { loading, branches } = this.state;
        let userBranches = branches;
        if (user && user.level > 10 && user.branches && user.branches.length > 0)
            userBranches = branches.filter(branch => user.branches != null ? user.branches.includes(branch.BranchId) : false);
        if (userBranches.length === 0)
            return <div className="planogram-selection loader"></div>;
        return (
            <div className="planogram-selection">
                <div className="container">
                    {/* <h3>סניפים: </h3> */}
                    <div className="branch-select scroller">
                        {userBranches.map((b: System.Branch) => (
                            <NavLink
                                key={"option_" + b.BranchId}
                                to={PLANOGRAM_BASE_URL + "/" + b.BranchId}
                                className="selection-branch"
                                activeClassName="selected">{b.Name}
                            </NavLink>
                        ))}
                    </div>
                    <div className="selection-content">
                        <Route path={PLANOGRAM_BASE_URL + "/:branch_id"} component={PlanogramStoreSelection} />
                    </div>
                </div>
            </div>
        )
    }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PlanogramSelection));