import React from "react";
import { Redirect } from "react-router-dom";

import "./LoginScreen.scss";
import brandLogo from '../../assets/images/brand-logo.png';
import { connect } from "react-redux";
import { AppState } from "shared/store/app.reducer";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import { setUser } from "shared/store/auth/auth.actions";
import { login } from "shared/auth/auth.service";

type LoginComponentState = {
  isLogged: boolean,
  submit: boolean,
  username: string,
  loginAttempts: number,
  errorMessages: string[]
}

const mapStateToProps = (state: AppState) => ({
  user: state.auth.user
});
const mapDispatchToProps = (dispatch: ThunkDispatch<AppState, {}, AnyAction>) => ({
  logout: () => dispatch(setUser()),
  // login: (user: AuthUser) => dispatch(setUser(user))
});

class LoginScreen extends React.Component<ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>, LoginComponentState>  {
  state = {
    isLogged: this.props.user != null,
    username: "",
    submit: false,
    loginAttempts: 0,
    errorMessages: []
  };

  failSubmit = (err: any) => {
    let message = "";
    if (err && err.code === 500) {
      message = "Something went wrong, try again later.";
    }
    // const loginAttempts = this.state.loginAttempts;
    this.setState({
      isLogged: false,
      submit: false,
      // loginAttempts: loginAttempts + 1,
      errorMessages: [message || err.message]
    });
  }
  successSubmit = () => {
    this.setState({
      isLogged: true,
      submit: false,
      errorMessages: []
    });
  }

  handleSubmit = (event: any) => {
    event.preventDefault();
    this.setState({ submit: true });
    const username = event.target.username.value;
    const password = event.target.password.value;
    this.setState({ submit: true, username: username });
    // const loginAttempts = this.state.loginAttempts;
    // if (loginAttempts > 5)
    //   return this.failSubmit(new Error("Too many attempts login."));
    // setTimeout(() => {
    login(username, password)
      .then(success => {
        if (success) {
          // this.props.login(initialUser)
          this.successSubmit();
        } else {
          this.failSubmit("Almost there!");
        }
      })
      .catch(res => {
        this.failSubmit(res);
      });
    // }, 2000);
  }

  render() {
    const { isLogged, username } = this.state;
    if (isLogged) return <Redirect to="/" />;

    const errorMessages = this.state.errorMessages || [];

    const loader = (
      <div className="app-loader">
        <div className="loader" />
      </div>
    );
    const form = (
      <div className="login-container">
        <img src={brandLogo} style={{ minHeight: "200px" }} alt="Algoretail Logo" />
        <form onSubmit={this.handleSubmit}>
          {errorMessages.map(item => {
            return <span key={item} className="error">{item}</span>;
          })}
          <div className="input-row">
            <label htmlFor="username">שם משתמש:</label>
            <input
              type="text"
              name="username"
              defaultValue={username}
              placeholder="שם משתמש..."
            />
          </div>
          <div className="input-row">
            <label htmlFor="password">סיסמא:</label>
            <input type="password" name="password" placeholder="********" />
          </div>
          <div className="input-row">
            <input
              type="submit"
              value="התחבר"
              className="input-row-submit"
              disabled={this.state.submit}
            />
          </div>
        </form>
      </div>
    );
    return <div className="app-login">{this.state.submit ? loader : form}</div>;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);
