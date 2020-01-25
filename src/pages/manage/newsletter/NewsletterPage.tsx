
import React, { Component } from 'react';
import { NavBarSection } from 'shared/interfaces/models/SystemModels';
import { AuthUser } from 'shared/interfaces/models/User';
import { NavLink, Switch, Route, Redirect } from 'react-router-dom';
import CustomNavLink from '../../../shared/components/CustomeNavLink';
import Subtitle from './Subtitle';
import Yedmiv from './Yedmiv';
import Yedtz from './Yedtz';
import Yed from './Yed';
import Yedion from './Yedion';
import ProductCampaign from './Product-campaign'




export const NEWSLETTER_BASE = "/newsletter";

class NewsletterPage extends Component {
    fullNavBar: NavBarSection[] = require('./NewsletterNavBar.json');

    componentDidMount = () => {
    }

    render() {
        //let user = getUser();

        return (
            <div className="composite-page">
                <div className="page-navigation-bar">
                    {this.fullNavBar.map((item, i) => <CustomNavLink key={'subLevel' + i + "_" + item.title} data={item}
                        baseUrl={NEWSLETTER_BASE}
                    // user={user} 
                    />)}
                </div>
                <div style={{ height: '100%' }}>
                    <Switch>
                        <Route path={NEWSLETTER_BASE} exact render={(props) => <div style={{ paddingRight: '3em' }}>
                            <h1>HOME PAGE NEWSLETTER</h1>
                        </div>
                        } />

                        <Route path={NEWSLETTER_BASE + "/subtitle"} exact render={(props) =>
                            <Subtitle
                                {...props}
                            />}
                        />

                        <Route path={NEWSLETTER_BASE + "/yedmiv"} exact render={(props) =>
                            <Yedmiv
                                {...props}
                            />}
                        />

                        <Route path={NEWSLETTER_BASE + "/yedtz"} exact render={(props) =>
                            <Yedtz
                                {...props}
                            />}
                        />

                        <Route path={NEWSLETTER_BASE + "/yed"} exact render={(props) =>
                            <Yed
                                {...props}
                            />}
                        />

                        <Route path={NEWSLETTER_BASE + "/yedion"} exact render={(props) =>
                            <Yedion
                                {...props}
                            />}
                        />

                        <Route path={NEWSLETTER_BASE + "/product-campaign"} exact render={(props) =>
                            <ProductCampaign
                                {...props}
                            />}
                        />


                        
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
                        <Route render={() => <Redirect to={NEWSLETTER_BASE} />} />
                    </Switch>
                </div>
            </div>
        );
    }

}

export default NewsletterPage;
