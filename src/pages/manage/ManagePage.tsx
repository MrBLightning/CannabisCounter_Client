import React, { Component, FC } from "react";
import { NavLink, Switch, Route, Redirect, withRouter, RouteComponentProps } from 'react-router-dom';
import { LocationListener, UnregisterCallback } from "history";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faUser, faTimes, faDoorOpen, faStore, faHome, IconDefinition, 
        faTags, faFileAlt, faEnvelopeOpenText, faShippingFast, faBoxes, faUserTie, 
        faServer, faMapMarkerAlt, faPrescriptionBottleAlt, faCannabis, faIndustry } from "@fortawesome/free-solid-svg-icons";
import { ModalContainer } from "shared/components/Modal";

import * as authService from 'shared/auth/auth.service';
import PlanogramScreenComponent from "./planogram/PlanogramScreen";
// import brandText from '../../assets/images/AlgoretailText.png';
import brandLogo from '../../assets/images/brand-logo.png';
import NotFound from "../NotFound";
import { AppState } from "shared/store/app.reducer";
import "./dashboard.scss";
import "./pages.scss";
import DashboardMain from "./dashboard/DashboardMain";
import CatalogPage from "./catalog/CatalogPage";
import DocumentsPage from "./deocuments/DocumentsPage";
import NewsletterPage from "./newsletter/NewsletterPage";
import OrdersPage from "./orders/OrdersPage";
import InventoryPage from "./inventory/InventoryPage";
import ManagementPage from "./management/ManagementPage";
import SystemPage from "./system/SystemPage";
import { getLatestVersion } from "shared/components/Version-control";
import { Dispatch } from "redux";
import { setAppVersion } from "shared/store/system/system.actions";
import { NavBarSection } from "shared/interfaces/models/SystemModels";
import { AuthUser } from "shared/interfaces/models/User";
import { RbacPermission } from "shared/store/auth/auth.types";
import { getPermission } from "shared/auth/auth.service";
import { VersionRoute } from "shared/components/VersionRoute";
import { Locations } from "./Locations";
import { Catalogs } from "./Catalogs";
import { Pharmacies } from "./Pharmacies";
import { Stocks } from "./Stocks";
import { Suppliers } from "./Suppliers";

type DashboardState = {
    drawerOpen: boolean,
    title?: string,
}
let unregisterLocationListener: UnregisterCallback;

const mapStateToProps = (state: AppState, ownProps: RouteComponentProps) => ({
    ...ownProps,
    user: state.auth.user,
    version: state.system.app_version,
    permissions: state.auth.permissions
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setVersion: (version: string) => {
        dispatch(setAppVersion(version));
    }
})

export const URL_BASE = "http://localhost:3000";

class ManagePageComponent extends Component<ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>> {
    versionButton: any = null;
    fullNavBar: NavBarSection[] = require('./MainNavBar.json');
    state: DashboardState = {
        drawerOpen: false
    }
    setVersionButton = (component: any) => {
        this.versionButton = component;
        this.forceUpdate();
    }
    async componentDidMount() {
        setVersionButton = this.setVersionButton;
        const { history } = this.props;
        unregisterLocationListener = history.listen(this.locationListener);

        const { setVersion } = this.props;
        // get app version from localStorage for the first time
        const latestVersion = localStorage.getItem('localVersion');
        // save the manifest version in the AppStore
        if (latestVersion) setVersion(latestVersion);
    }
    componentWillUnmount() {
        if (unregisterLocationListener instanceof Function)
            unregisterLocationListener();
    }
    locationListener: LocationListener = (location) => {
        if (location.pathname !== this.props.location.pathname)
            this.setState({ drawerOpen: false });
    }

    handleMenuToggle = () => {
        this.setState({
            drawerOpen: this.state.drawerOpen ? false : true
        });
    }
    handleMenuOpen = () => {
        this.setState({
            drawerOpen: true
        });
    }
    handleMenuClose = () => {
        this.setState({
            drawerOpen: false
        });
    }

    render() {
        const { drawerOpen, title } = this.state;
        const { user } = this.props;
        let VersionButton = this.versionButton;
        const { version } = this.props;
        if (!user) throw new Error("NOT LOGGED SHIT")
        // </div>;
        return <div className="dashboard">
            <header className="header">
                <nav className="header-nav">
                    <div className="header-menu" onClick={this.handleMenuToggle}>
                        <FontAwesomeIcon icon={drawerOpen ? faTimes : faBars} />
                    </div>
                    <div className="header-logo">
                        {/* <NavLink to="/"> */}
                            {/* Algoretail{title ? " - " + title : ""} */}
                            <a href="/"><img src={brandLogo} width='30px'/></a>
                        {/* </NavLink> */}
                        {/* 
                        <div className="header-actions">
                            <div className="header-version">
                                {'Ver ' + version + " - " + user.netw}
                            </div>
                        </div>
                        */}
                    </div>
                    <div className="header-actions">
                        {/* {VersionButton
                            ? <VersionButton />
                            : null} */}
                        {/* <div className="header-version">{'Ver ' + version}</div>     */}
                        {user != null ? <React.Fragment>
                            <NavLink to="/profile" className="header-action" onClick={() => { }}>
                                <FontAwesomeIcon icon={faUser} />
                                <span style={{paddingRight:"0.5em"}}>{user.name || "אנונימי"}</span>
                            </NavLink>
                            <a href="#" className="header-action logout" onClick={e => {
                                e.stopPropagation();
                                authService.logout();
                            }}>
                                <FontAwesomeIcon icon={faDoorOpen} />
                                {/* <span>התנתק</span> */}
                            </a>
                        </React.Fragment> : null}
                        {/* <a href="#" className="header-action" onClick={() => { }}>
                            <FontAwesomeIcon icon={faFilter} />
                        </a>
                        <a href="#" className="header-action" onClick={() => { }}>
                            <span className="number-tag">12</span>
                            <FontAwesomeIcon icon={faArchive} />
                        </a> */}
                    </div>
                </nav>
            </header>
            <section className="dashboard-main">
                <DashbaordDrawer fullNavBar={this.fullNavBar} user={user} permissions={this.props.permissions} drawerOpen={drawerOpen} handleMenuClose={() => this.handleMenuClose()} />
                <div className="dashboard-body">
                    <Switch>
                        <Route path="/" exact component={HomeComponent} />
                        <VersionRoute path={"/locations"} render={(props: any) =>
                            <Locations
                                {...props}
                                permission={getPermission("manage/locations", this.props.permissions)}
                                user={user}/>}
                        />
                        <VersionRoute path={"/catalog"} render={(props: any) =>
                            <Catalogs
                                {...props}
                                permission={getPermission("manage/item", this.props.permissions)}
                                user={user}/>}
                        />
                        <VersionRoute path={"/pharmacy"} render={(props: any) =>
                            <Pharmacies
                                {...props}
                                permission={getPermission("manage/pharmacy", this.props.permissions)}
                                user={user}/>}
                        />
                        <VersionRoute path={"/stock"} render={(props: any) =>
                            <Stocks
                                {...props}
                                permission={getPermission("manage/stock", this.props.permissions)}
                                user={user}/>}
                        />
                        <VersionRoute path={"/suppliers"} render={(props: any) =>
                            <Suppliers
                                {...props}
                                permission={getPermission("manage/stock", this.props.permissions)}
                                user={user}/>}
                        />
                        {/*
                        <Route path="/planogram" component={PlanogramScreenComponent} />
                        <Route path="/catalog" component={CatalogPage} />
                        <Route path="/documents" component={DocumentsPage} />
                        <Route path="/newsletter" component={NewsletterPage} />
                        <Route path="/orders" component={OrdersPage} />
                        <Route path="/inventory" component={InventoryPage} />
                        <Route path="/management" component={ManagementPage} />
                        <Route path="/system" component={SystemPage} />
                        */}
                        <Route component={NotFound} />


                    </Switch>
                </div>
            </section>
            <footer></footer>
            <ModalContainer />
        </div>;
    }
}
// export const ManagePage = withRouter(connect(mapStateToProps)(ManagePageComponent));
export const ManagePage = withRouter(connect(mapStateToProps, mapDispatchToProps)(ManagePageComponent));
export let setVersionButton: (comp: any) => void;

const HomeComponent = (props: any) => (<div className="home-panel">
    {/* <Redirect to={"/planogram"} /> */}
    <h1>HOME PAGE</h1>
</div>);

const DashbaordDrawer: FC<{
    drawerOpen: boolean,
    fullNavBar: NavBarSection[],
    user: AuthUser, 
    permissions: RbacPermission[] | undefined,
    handleMenuClose: () => void
}> = ({ drawerOpen, handleMenuClose, fullNavBar, user, permissions }) => {
    return (
        <aside className={"dashboard-drawer" + (drawerOpen ? " open" : "")} onClick={handleMenuClose}>
            <nav className={"drawer-nav"} onClick={(e) => e.stopPropagation()}>
                {/* <h3 className="drawer-title">Algoretail</h3> */}
                {fullNavBar.map((item, i) => {
                    let thisActionPermission = getPermission(item.action, permissions);
                    let icon:IconDefinition = faHome;
                    if(item.title==="מיקום") icon = faMapMarkerAlt;
                    if(item.title==="מוצרים") icon = faTags;
                    if(item.title==="בית מרקחת") icon = faPrescriptionBottleAlt;
                    if(item.title==="מלאי") icon = faCannabis;
                    if(item.title==="יצרנים") icon = faIndustry;
                    if ((user && user.role === "super_admin") || thisActionPermission.read || thisActionPermission.action === "")
                        return <DashboardDrawerItem key={'subLevel' + i + "_" + item.title} exact path={item.navLink} icon={icon} label={item.title}/>;
                })}
                {/*
                <DashboardDrawerItem exact path="/locations" icon={faMapMarkerAlt} label={"מיקום"} />
                <DashboardDrawerItem exact path="/catalog" icon={faTags} label={"מוצרים"} />
                <DashboardDrawerItem exact path="/pharmacy" icon={faPrescriptionBottleAlt} label={"בית מרקחת"} />
                <DashboardDrawerItem exact path="/stock" icon={faCannabis} label={"מלאי"} />
                */}    
                {/* 
                <DashboardDrawerItem exact path="/" icon={faHome} label={"דף הבית"} />
                <DashboardDrawerItem path="/documents" icon={faFileAlt} label={"מסמכים"} />
                <DashboardDrawerItem path="/planogram" icon={faStore} label={"פלנוגרמה"} />
                <DashboardDrawerItem path="/newsletter" icon={faEnvelopeOpenText} label={"ידיעון"} />
                <DashboardDrawerItem path="/orders" icon={faShippingFast} label={"הזמנה"} />
                <DashboardDrawerItem path="/inventory" icon={faBoxes} label={"מלאי"} />
                <DashboardDrawerItem path="/catalog" icon={faTags} label={"קטלוג"} />
                <DashboardDrawerItem path="/management" icon={faUserTie} label={"ניהול"} />
                <DashboardDrawerItem path="/system" icon={faServer} label={"מערכת"} />
                */}
            </nav>
        </aside>
    )
}

const DashboardDrawerItem: FC<{ path: string, exact?: boolean, label: string, icon: IconDefinition }> = ({ path, exact, label, icon }) => (
    <NavLink className="drawer-item" activeClassName="active" to={path} exact={exact}>
        <div className="drawer-item-icon"><div className="icon-container"><FontAwesomeIcon icon={icon} /></div></div>
        <div className="drawer-item-label">{label}</div>
    </NavLink>
)