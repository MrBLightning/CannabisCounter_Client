
import React, { Component } from 'react';
import { NavBarSection } from 'shared/interfaces/models/SystemModels';
import { AuthUser } from 'shared/interfaces/models/User';
import { NavLink, Switch, Route, Redirect, RouteComponentProps } from 'react-router-dom';
import CustomNavLink from '../../../shared/components/CustomeNavLink';
import { AppState } from 'shared/store/app.reducer';
import { connect } from "react-redux"
import { checkPageVersion } from 'shared/components/Version-control';
import { checkPageToeknTime } from 'shared/components/Token-time-control';
import { setVersionButton } from '../ManagePage';
import { getPermission } from 'shared/auth/auth.service';
import { VersionRoute } from 'shared/components/VersionRoute';
import { ReserveFishs } from './ReserveFishs';
import { ReserveChickens } from './ReserveChicken';
import { DistSingleItem } from './DistSingleItem';

export const ORDERS_BASE = "/orders";

const mapStateToProps = (state: AppState, ownProps: RouteComponentProps) => ({
    ...ownProps,
    user: state.auth.user,
    permissions: state.auth.permissions
})

class OrdersPage extends Component<ReturnType<typeof mapStateToProps>> {
    fullNavBar: NavBarSection[] = require('./OrdersNavBar.json');

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
        const { user, permissions } = this.props;

        return (
            <div className="composite-page">
                <div className="page-navigation-bar">
                    {this.fullNavBar.map((item, i) => {
                        let thisActionPermission = getPermission(item.action, permissions);
                        if ((user && user.role === "super_admin") || thisActionPermission.read || thisActionPermission.action === "")
                            return <CustomNavLink key={'subLevel' + i + "_" + item.title} data={item} baseUrl={ORDERS_BASE} />;
                    })}
                </div>
                <div style={{ height: '100%' }}>
                    <Switch>
                        <VersionRoute path={ORDERS_BASE} exact render={(props: any) =>
                            <div style={{ paddingRight: '3em' }}>
                                <h1>HOME PAGE DOCUMENTS</h1>
                            </div>} />
                        <VersionRoute path={ORDERS_BASE + "/reserveFish"} exact render={(props: any) =>
                            <ReserveFishs
                                {...props}
                                permission={getPermission("order/reserveFish", permissions)} 
                                user={user}/>}
                        />
                        <VersionRoute path={ORDERS_BASE + "/reserveChicken"} exact render={(props: any) =>
                            <ReserveChickens
                                {...props}
                                permission={getPermission("order/reserveChicken", permissions)} 
                                user={user}/>}
                        />
                        <VersionRoute path={ORDERS_BASE + "/distSingleItem"} exact render={(props: any) =>
                            <DistSingleItem
                                {...props}
                                permission={getPermission("order/distSingleItem", permissions)} 
                                user={user}/>}
                        />
                        <VersionRoute render={() => <Redirect to={ORDERS_BASE} />} />
                    </Switch>
                </div>
            </div>
        );
    }

}

export default connect(mapStateToProps)(OrdersPage);