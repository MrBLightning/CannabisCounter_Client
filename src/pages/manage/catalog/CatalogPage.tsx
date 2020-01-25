
import React, { Component } from 'react';
import { NavBarSection } from 'shared/interfaces/models/SystemModels';
import { AuthUser } from 'shared/interfaces/models/User';
import { NavLink, Switch, Route, Redirect, RouteComponentProps } from 'react-router-dom';
import { Departments } from './Departments';
import { Groups } from './Groups';
import { SubGroups } from './SubGroups';
import CustomNavLink from '../../../shared/components/CustomeNavLink';
import { checkPageVersion } from 'shared/components/Version-control';
import { setVersionButton } from '../ManagePage';
import { VersionRoute } from 'shared/components/VersionRoute';
import { checkPageToeknTime } from 'shared/components/Token-time-control';
import { Degems } from './Degems';
import { Items } from './Items';
import { AppState } from 'shared/store/app.reducer';
import { connect } from "react-redux"
import { getPermission } from 'shared/auth/auth.service';
import { MigvanBranches } from './MigvanBranches';
import { MigvanSapakim } from './MigvanSapakim';
import { Peruks } from './Peruks';
import { Subbars } from './Subbars';
import { SubbarGenerals } from './SubbarGenerals';

export const CATALOG_BASE = "/catalog";

const mapStateToProps = (state: AppState, ownProps: RouteComponentProps) => ({
    ...ownProps,
    user: state.auth.user,
    permissions: state.auth.permissions
})

class CatalogPage extends Component<ReturnType<typeof mapStateToProps>> {
    fullNavBar: NavBarSection[] = require('./CatalogNavBar.json');

    componentDidMount() {
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
                            return <CustomNavLink key={'subLevel' + i + "_" + item.title} data={item} baseUrl={CATALOG_BASE} />;
                    })}
                </div>
                <div style={{ height: '100%' }}>
                    <Switch>
                        <VersionRoute path={CATALOG_BASE} exact render={(props: any) =>
                            <div style={{ paddingRight: '3em' }}>
                                <h1>HOME PAGE CATALOG</h1>
                            </div>} />
                        <VersionRoute path={CATALOG_BASE + "/items"} exact render={(props: any) =>
                            <Items
                                {...props}
                                permission={getPermission("manage/item", permissions)}/>}
                        />
                        <VersionRoute path={CATALOG_BASE + "/migvanbranch"} exact render={(props: any) =>
                            <MigvanBranches
                                {...props}
                                permission={getPermission("manage/migvanBranch", permissions)}/>}
                        />
                        <VersionRoute path={CATALOG_BASE + "/migvansapak"} exact render={(props: any) =>
                            <MigvanSapakim
                                {...props}
                                permission={getPermission("manage/migvanSapak", permissions)}/>}
                        />
                        <VersionRoute path={CATALOG_BASE + "/departments"} exact render={(props: any) =>
                            <Departments
                                {...props}
                                permission={getPermission("manage/departments", permissions)}/>}
                        />
                        <VersionRoute path={CATALOG_BASE + "/groups"} exact render={(props: any) =>
                            <Groups
                                {...props}
                                permission={getPermission("manage/group", permissions)}/>}
                        />
                        <VersionRoute path={CATALOG_BASE + "/subgroups"} exact render={(props: any) =>
                            <SubGroups
                                {...props}
                                permission={getPermission("manage/subgroup", permissions)}/>}
                        />
                        <VersionRoute path={CATALOG_BASE + "/degems"} exact render={(props: any) =>
                            <Degems
                                {...props}
                                permission={getPermission("manage/degem", permissions)}/>}
                        />
                        <VersionRoute path={CATALOG_BASE + "/peruks"} exact render={(props: any) =>
                            <Peruks
                                {...props}
                                permission={getPermission("manage/peruk", permissions)}/>}
                        />
                        <VersionRoute path={CATALOG_BASE + "/subbars"} exact render={(props: any) =>
                            <Subbars
                                {...props}
                                permission={getPermission("manage/subbar", permissions)}/>}
                        />
                        <VersionRoute path={CATALOG_BASE + "/subbargenerals"} exact render={(props: any) =>
                            <SubbarGenerals
                                {...props}
                                permission={getPermission("manage/subbargeneral", permissions)}/>}
                        />
                        <VersionRoute render={() => <Redirect to={CATALOG_BASE} />} />
                    </Switch>
                </div>
            </div>
        );
    }

}

//export default CatalogPage;
export default connect(mapStateToProps)(CatalogPage);