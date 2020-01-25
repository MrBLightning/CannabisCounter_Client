import React, { ComponentProps } from 'react'
import { connect } from "react-redux";
import { AppState } from 'shared/store/app.reducer';

export type AuthWrapperProps = {
    required?: boolean,
    level?: number,
}

const mapStateToProps = (state: AppState, ownProps: {
    children: JSX.Element,
} & AuthWrapperProps) => ({
    ...ownProps,
    isLogged: state.auth.user != null && state.auth.token != null,
    // userLevel: state.auth.user && state.auth.user.level != null ? state.auth.user.level : 100,
    
    /* IMPORTANT ! IMPORTANT ! IMPORTANT ! IMPORTANT ! */
    /* In the old system users had a level. In the new system they do not
       Without the level the default was set to 100 and so no one could
       get in to see the Planogram.
       By Shuki's request I hard coded the user-level to 0 so that EVERYONE HAS ACCESS.
       It's very important to make sure we implemnent the new role permission rules here
       to make the user.level not relevent. */
    userLevel: 0
});

export const AuthRenderer = connect(mapStateToProps)((props: ReturnType<typeof mapStateToProps>): any => {
    const { children, level } = props;
    const { isLogged, userLevel } = props;
    let hasAccess = false;
    if (isLogged) {
        hasAccess = true;
        if (level != null)
            hasAccess = userLevel <= level;
    }

    return hasAccess ? children : null;
})