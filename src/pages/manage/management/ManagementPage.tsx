
import React, { Component } from 'react';
import { NavBarSection } from 'shared/interfaces/models/SystemModels';
import { AuthUser } from 'shared/interfaces/models/User';
import { NavLink, Switch, Route, Redirect, RouteComponentProps } from 'react-router-dom';
import CustomNavLink from '../../../shared/components/CustomeNavLink';
import { checkPageVersion } from 'shared/components/Version-control';
import { checkPageToeknTime } from 'shared/components/Token-time-control';
import { setVersionButton } from '../ManagePage';
import { VersionRoute } from 'shared/components/VersionRoute';
import { Sapakim } from './Sapakim';
import { AppState } from 'shared/store/app.reducer';
import { connect } from "react-redux"
import { getPermission } from 'shared/auth/auth.service';
import { Branches } from './Branches';
import { Aspaka } from './Aspaka';
import { Supsiryuns } from './Supsiryuns';
import { Dorders } from './Dorders';
import { Sibas } from './Sibas';
import { SibaDestructions } from './SibaDestructions';
import { SibaTransfers } from './SibaTransfers';
import { SibaConversions } from './SibaConversions';
import { SibaAuths } from './SibaAuths';
import { CodeConversions } from './CodeConversions';
import { Networks } from './Networks';
import { UnitSizes } from './UnitSizes';
import { SingleSupplierItems } from './SingleSupplierItems';

export const MANAGEMENT_BASE = "/management";

const mapStateToProps = (state: AppState, ownProps: RouteComponentProps) => ({
    ...ownProps,
    user: state.auth.user,
    permissions: state.auth.permissions
})

class ManagementPage extends Component<ReturnType<typeof mapStateToProps>> {
    fullNavBar: NavBarSection[] = require('./ManagementNavBar.json');

    componentDidMount = () => {
        // check page version
        checkPageVersion();
        // check token expDate
        checkPageToeknTime();

        //make sure the function we defined in ManagePage has already mounted
        // since this is all non synchronous without the test it fails
        if (setVersionButton)
            setVersionButton(() => (
                <div className="header-version">{'Ver ' + localStorage.getItem('localVersion')}</div>
            ));
    }

    render() {
        const {user, permissions} = this.props;
        return (
            <div className="composite-page">
                <div className="page-navigation-bar">
                    {this.fullNavBar.map((item, i) => {
                        let thisActionPermission = getPermission(item.action, permissions);
                        if ((user && user.role === "super_admin") || thisActionPermission.read || thisActionPermission.action === "")
                            return <CustomNavLink key={'subLevel' + i + "_" + item.title} data={item} baseUrl={MANAGEMENT_BASE} />;
                    })}
                </div>
                <div style={{ height: '100%' }}>
                    <Switch>
                        <VersionRoute path={MANAGEMENT_BASE} exact render={(props: any) =>
                            <div style={{ paddingRight: '3em' }}>
                                <h1>HOME PAGE MANAGEMENT</h1>
                            </div>} />
                        <VersionRoute path={MANAGEMENT_BASE + "/branches"} exact render={(props: any) =>
                            <Branches
                                {...props}
                                permission={getPermission("manage/branch", permissions)}/>}
                        />
                        <VersionRoute path={MANAGEMENT_BASE + "/sapakim"} exact render={(props: any) =>
                            <Sapakim
                                {...props}
                                permission={getPermission("manage/sapak", permissions)}/>}
                        />
                        <VersionRoute path={MANAGEMENT_BASE + "/aspaka"} exact render={(props: any) =>
                            <Aspaka
                                {...props}
                                permission={getPermission("manage/aspaka", permissions)}/>}
                        />
                        <VersionRoute path={MANAGEMENT_BASE + "/supsiryun"} exact render={(props: any) =>
                            <Supsiryuns
                                {...props}
                                permission={getPermission("manage/supsiryun", permissions)}/>}
                        />
                        <VersionRoute path={MANAGEMENT_BASE + "/dorders"} exact render={(props: any) =>
                            <Dorders
                                {...props}
                                permission={getPermission("manage/dorder", permissions)}/>}
                        />
                        <VersionRoute path={MANAGEMENT_BASE + "/sibaDestructions"} exact render={(props: any) =>
                            <SibaDestructions
                                {...props}
                                permission={getPermission("manage/siba", permissions)}/>}
                        />
                        <VersionRoute path={MANAGEMENT_BASE + "/sibaTransfers"} exact render={(props: any) =>
                            <SibaTransfers
                                {...props}
                                permission={getPermission("manage/siba", permissions)}/>}
                        />
                        <VersionRoute path={MANAGEMENT_BASE + "/sibaConversions"} exact render={(props: any) =>
                            <SibaConversions
                                {...props}
                                permission={getPermission("manage/siba", permissions)}/>}
                        />
                        <VersionRoute path={MANAGEMENT_BASE + "/sibaAuths"} exact render={(props: any) =>
                            <SibaAuths
                                {...props}
                                permission={getPermission("manage/siba", permissions)}/>}
                        />
                        <VersionRoute path={MANAGEMENT_BASE + "/codeConversion"} exact render={(props: any) =>
                            <CodeConversions
                                {...props}
                                permission={getPermission("manage/codeConversion", permissions)}/>}
                        />
                        <VersionRoute path={MANAGEMENT_BASE + "/networks"} exact render={(props: any) =>
                            <Networks
                                {...props}
                                permission={getPermission("manage/branchNetwork", permissions)}/>}
                        />
                        <VersionRoute path={MANAGEMENT_BASE + "/unitSize"} exact render={(props: any) =>
                            <UnitSizes
                                {...props}
                                permission={getPermission("manage/unitSize", permissions)}/>}
                        />
                        <VersionRoute path={MANAGEMENT_BASE + "/singleSupplierItem"} exact render={(props: any) =>
                            <SingleSupplierItems
                                {...props}
                                permission={getPermission("manage/singleSupplierItem", permissions)}/>}
                        />
                        <Route render={() => <Redirect to={MANAGEMENT_BASE} />} />
                    </Switch>
                </div>
            </div>
        );
    }

}

// export default ManagementPage;
export default connect(mapStateToProps)(ManagementPage);