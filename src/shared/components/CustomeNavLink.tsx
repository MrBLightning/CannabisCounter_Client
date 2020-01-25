import React, { Component } from 'react';
import { NavBarSection } from "shared/interfaces/models/SystemModels";
import { NavLink } from "react-router-dom";

type CustomNavLinkProps = {
    data: NavBarSection
    baseUrl: string
    // user: AuthUser | null
};

class CustomNavLink extends Component<CustomNavLinkProps>
{
    render() {
        const { data, baseUrl } = this.props;
        // const { data, user } = this.props;
        // IMPORTANT - user / permission test should come here

        return (
            <NavLink className={"navbar-link" + (data.disabled ? " disabled" : "")}
                activeClassName="active" id={data.id} to={baseUrl + data.navLink}
            >{data.title}</NavLink>
        )
    }
}

export default CustomNavLink;