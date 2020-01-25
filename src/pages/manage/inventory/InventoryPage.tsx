
import React, { Component } from 'react';
import { NavBarSection } from 'shared/interfaces/models/SystemModels';
import { AuthUser } from 'shared/interfaces/models/User';
import { NavLink, Switch, Route, Redirect } from 'react-router-dom';
import CustomNavLink from '../../../shared/components/CustomeNavLink';


export const INVENTORY_BASE = "/inventory";

class InventoryPage extends Component {
    fullNavBar: NavBarSection[] = require('./InventoryNavBar.json');

    componentDidMount = () => {
    }

    render() {
        //let user = getUser();

        return (
            <div className="composite-page">
                <div className="page-navigation-bar">
                    {this.fullNavBar.map((item, i) => <CustomNavLink key={'subLevel' + i + "_" + item.title} data={item} 
                        baseUrl={INVENTORY_BASE}
                    // user={user} 
                    />)}
                </div>
                <div style={{height:'100%'}}>
                    <Switch>
                        <Route path={INVENTORY_BASE} exact render={(props) => <div style={{paddingRight:'3em'}}>
                            <h1>HOME PAGE INVENTORY</h1>
                        </div>
                        } />
                        {/* <Route path={DOCUMENTS_BASE + "/departments"} exact render={(props) =>
                            <Departments
                                {...props}
                                fullNavBar={this.fullNavBar} />}
                        />
                        <Route path={DOCUMENTS_BASE + "/groups"} exact render={(props) =>
                            <Groups
                                {...props}
                                fullNavBar={this.fullNavBar} />}
                        />
                        <Route path={DOCUMENTS_BASE + "/subgroups"} exact render={(props) =>
                            <SubGroups
                                {...props}
                                fullNavBar={this.fullNavBar} />}
                        /> */}
                        <Route render={() => <Redirect to={INVENTORY_BASE} />} />
                    </Switch>
                </div>
            </div>
        );
    }

}

export default InventoryPage;
